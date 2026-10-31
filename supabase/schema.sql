-- Infopeso · Etapa 1: cuentas y carteras persistentes
--
-- Cómo aplicarlo: Supabase > SQL Editor > New query > pegar todo este archivo > Run.
-- Es idempotente: se puede volver a correr sin romper nada.
--
-- Seguridad: todas las tablas tienen RLS activado. Cada usuario solo ve y modifica sus propias filas,
-- aunque alguien manipule el navegador. La clave pública (publishable) del front no puede saltarse esto.

-- ─── Perfiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
    id           uuid primary key references auth.users (id) on delete cascade,
    display_name text check (display_name is null or char_length(display_name) <= 80),
    plan         text not null default 'free' check (plan in ('free', 'premium')),
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

-- ─── Carteras ────────────────────────────────────────────────────────────────
-- kind 'simulated' = ponderaciones teóricas (lo que hoy hace la Cartera).
-- kind 'real' queda reservado para la Etapa 2 (transacciones con cantidades y precios).
create table if not exists public.portfolios (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
    name       text not null default 'Mi cartera' check (char_length(name) between 1 and 80),
    kind       text not null default 'simulated' check (kind in ('simulated', 'real')),
    is_default boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists portfolios_user_id_idx on public.portfolios (user_id);
-- Una sola cartera por defecto por usuario.
create unique index if not exists portfolios_one_default_per_user on public.portfolios (user_id) where is_default;

-- ─── Posiciones de cada cartera ──────────────────────────────────────────────
create table if not exists public.portfolio_items (
    id           uuid primary key default gen_random_uuid(),
    portfolio_id uuid not null references public.portfolios (id) on delete cascade,
    symbol       text not null check (symbol ~ '^[A-Z0-9.^=-]{1,20}$'),
    weight       numeric(7, 4) not null check (weight >= 0 and weight <= 100),
    position     smallint not null default 0,
    created_at   timestamptz not null default now(),
    unique (portfolio_id, symbol)
);

create index if not exists portfolio_items_portfolio_id_idx on public.portfolio_items (portfolio_id);

-- ─── Mantener updated_at ─────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
    for each row execute function public.touch_updated_at();

drop trigger if exists portfolios_touch_updated_at on public.portfolios;
create trigger portfolios_touch_updated_at before update on public.portfolios
    for each row execute function public.touch_updated_at();

-- ─── Alta de usuario: crea perfil y cartera por defecto ──────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, display_name)
    values (new.id, nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 80), ''));

    insert into public.portfolios (user_id, name, kind, is_default)
    values (new.id, 'Mi cartera', 'simulated', true);

    return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
    for each row execute function public.handle_new_user();

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.portfolios      enable row level security;
alter table public.portfolio_items enable row level security;

-- Permisos explícitos: sin sesión no se accede a nada.
revoke all on public.profiles        from anon, authenticated;
revoke all on public.portfolios      from anon, authenticated;
revoke all on public.portfolio_items from anon, authenticated;

-- profiles: el usuario lee su perfil y solo puede editar el nombre.
-- El campo plan no es editable desde el cliente (columna sin permiso de UPDATE): lo cambiará el servidor.
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
    for select to authenticated
    using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
    for update to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

-- portfolios
grant select, insert, update, delete on public.portfolios to authenticated;

drop policy if exists "portfolios_all_own" on public.portfolios;
create policy "portfolios_all_own" on public.portfolios
    for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

-- portfolio_items: se accede a través de la cartera dueña.
grant select, insert, update, delete on public.portfolio_items to authenticated;

drop policy if exists "portfolio_items_all_own" on public.portfolio_items;
create policy "portfolio_items_all_own" on public.portfolio_items
    for all to authenticated
    using (exists (
        select 1 from public.portfolios p
        where p.id = portfolio_id and p.user_id = (select auth.uid())
    ))
    with check (exists (
        select 1 from public.portfolios p
        where p.id = portfolio_id and p.user_id = (select auth.uid())
    ));

-- ─── Guardar una cartera completa en un solo paso (atómico) ──────────────────
-- security invoker: corre con los permisos del usuario, así que RLS sigue valiendo.
create or replace function public.replace_portfolio_items(p_portfolio_id uuid, p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if jsonb_typeof(p_items) is distinct from 'array' then
        raise exception 'p_items debe ser un array';
    end if;
    if jsonb_array_length(p_items) > 50 then
        raise exception 'Máximo 50 posiciones por cartera';
    end if;
    if not exists (
        select 1 from public.portfolios
        where id = p_portfolio_id and user_id = (select auth.uid())
    ) then
        raise exception 'Cartera inexistente';
    end if;

    delete from public.portfolio_items where portfolio_id = p_portfolio_id;

    insert into public.portfolio_items (portfolio_id, symbol, weight, position)
    select p_portfolio_id,
           upper(trim(e.item ->> 'symbol')),
           (e.item ->> 'weight')::numeric,
           (e.ord - 1)::smallint
    from jsonb_array_elements(p_items) with ordinality as e(item, ord);

    update public.portfolios set updated_at = now() where id = p_portfolio_id;
end;
$$;

revoke all on function public.replace_portfolio_items(uuid, jsonb) from public, anon;
grant execute on function public.replace_portfolio_items(uuid, jsonb) to authenticated;

-- ─── Eliminar la propia cuenta (Ley 25.326: derecho de supresión) ────────────
-- Borra el usuario de auth.users; por cascada se van su perfil, carteras y posiciones.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select auth.uid()) is null then
        raise exception 'No autenticado';
    end if;
    delete from auth.users where id = (select auth.uid());
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
