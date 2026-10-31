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

-- ─── Etapa 2: cartera real (posiciones con cantidades, multi-broker) ─────────
-- Se pega este bloque en el SQL Editor igual que el resto. Es idempotente.
-- Cada fila es "cuánto tengo de un ticker en un broker". El porcentaje de cada activo NO se guarda:
-- se calcula sumando las cantidades de todos los brokers y valuándolas con el precio de hoy.
create table if not exists public.portfolio_positions (
    id           uuid primary key default gen_random_uuid(),
    portfolio_id uuid not null references public.portfolios (id) on delete cascade,
    broker       text not null default 'Manual' check (char_length(broker) between 1 and 40),
    symbol       text not null check (symbol ~ '^[A-Z0-9.^=-]{1,20}$'),
    kind         text not null check (kind in ('stock', 'cedear', 'bond', 'note', 'corp', 'fund', 'cash', 'other')),
    quantity     numeric(24, 8) not null check (quantity >= 0),
    avg_cost     numeric(24, 8) check (avg_cost is null or avg_cost >= 0),
    currency     text not null default 'ARS' check (currency in ('ARS', 'USD')),
    file_value   numeric(24, 4) check (file_value is null or file_value >= 0),
    created_at   timestamptz not null default now(),
    unique (portfolio_id, broker, symbol)
);

create index if not exists portfolio_positions_portfolio_id_idx on public.portfolio_positions (portfolio_id);

alter table public.portfolio_positions enable row level security;
revoke all on public.portfolio_positions from anon, authenticated;
grant select, insert, update, delete on public.portfolio_positions to authenticated;

drop policy if exists "portfolio_positions_all_own" on public.portfolio_positions;
create policy "portfolio_positions_all_own" on public.portfolio_positions
    for all to authenticated
    using (exists (
        select 1 from public.portfolios p
        where p.id = portfolio_id and p.user_id = (select auth.uid())
    ))
    with check (exists (
        select 1 from public.portfolios p
        where p.id = portfolio_id and p.user_id = (select auth.uid())
    ));

-- Reemplaza todas las posiciones de una cartera en un solo paso (atómico). Corre con los permisos del usuario: RLS sigue valiendo.
create or replace function public.replace_portfolio_positions(p_portfolio_id uuid, p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if jsonb_typeof(p_items) is distinct from 'array' then
        raise exception 'p_items debe ser un array';
    end if;
    if jsonb_array_length(p_items) > 300 then
        raise exception 'Máximo 300 posiciones por cartera';
    end if;
    if not exists (
        select 1 from public.portfolios
        where id = p_portfolio_id and user_id = (select auth.uid())
    ) then
        raise exception 'Cartera inexistente';
    end if;

    delete from public.portfolio_positions where portfolio_id = p_portfolio_id;

    insert into public.portfolio_positions (portfolio_id, broker, symbol, kind, quantity, avg_cost, currency, file_value)
    select p_portfolio_id,
           left(trim(coalesce(nullif(e ->> 'broker', ''), 'Manual')), 40),
           upper(trim(e ->> 'symbol')),
           e ->> 'kind',
           (e ->> 'quantity')::numeric,
           nullif(e ->> 'avg_cost', '')::numeric,
           coalesce(nullif(e ->> 'currency', ''), 'ARS'),
           nullif(e ->> 'file_value', '')::numeric
    from jsonb_array_elements(p_items) as e;

    update public.portfolios set updated_at = now() where id = p_portfolio_id;
end;
$$;

revoke all on function public.replace_portfolio_positions(uuid, jsonb) from public, anon;
grant execute on function public.replace_portfolio_positions(uuid, jsonb) to authenticated;

-- ─── Etapa 3: historial diario, resumen semanal y medición del uso ───────────
-- Se pega este bloque en el SQL Editor igual que el resto. Es idempotente.

-- Resumen semanal por email: activado por defecto, el usuario puede apagarlo desde /cuenta o con el link de baja.
alter table public.profiles add column if not exists weekly_email boolean not null default true;
grant update (display_name, weekly_email) on public.profiles to authenticated;

-- Foto diaria del valor de cada cartera real. La escribe solo el servidor (clave secreta) desde el cron:
-- el usuario únicamente puede leer, así nadie fabrica su propio historial.
create table if not exists public.portfolio_snapshots (
    id           uuid primary key default gen_random_uuid(),
    portfolio_id uuid not null references public.portfolios (id) on delete cascade,
    snap_date    date not null,
    total_ars    numeric(24, 2) not null check (total_ars >= 0),
    total_usd    numeric(24, 2) check (total_usd is null or total_usd >= 0),
    mep          numeric(14, 4) check (mep is null or mep > 0),
    priced_share numeric(6, 2) not null default 100,
    holdings     jsonb not null default '[]'::jsonb,
    created_at   timestamptz not null default now(),
    unique (portfolio_id, snap_date)
);

create index if not exists portfolio_snapshots_portfolio_date_idx on public.portfolio_snapshots (portfolio_id, snap_date desc);

alter table public.portfolio_snapshots enable row level security;
revoke all on public.portfolio_snapshots from anon, authenticated;
grant select on public.portfolio_snapshots to authenticated;

drop policy if exists "portfolio_snapshots_select_own" on public.portfolio_snapshots;
create policy "portfolio_snapshots_select_own" on public.portfolio_snapshots
    for select to authenticated
    using (exists (
        select 1 from public.portfolios p
        where p.id = portfolio_id and p.user_id = (select auth.uid())
    ));

-- Eventos de uso anónimos (qué pasos del embudo se dan). Sin IP ni datos personales.
-- Sin ningún permiso para anon/authenticated: inserta solo la ruta /api/events con la clave secreta.
create table if not exists public.usage_events (
    id         bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    name       text not null check (name in (
        'cartera_view', 'import_open', 'import_preview', 'import_success', 'import_error',
        'manual_add', 'demo_view', 'signup_cta', 'account_linked', 'email_visit'
    )),
    anon_id    text not null check (char_length(anon_id) between 8 and 40),
    user_id    uuid references auth.users (id) on delete set null,
    path       text check (path is null or char_length(path) <= 120),
    props      jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 1024)
);

create index if not exists usage_events_name_created_idx on public.usage_events (name, created_at desc);
create index if not exists usage_events_anon_idx on public.usage_events (anon_id);
create index if not exists usage_events_user_idx on public.usage_events (user_id) where user_id is not null;

alter table public.usage_events enable row level security;
revoke all on public.usage_events from anon, authenticated;

-- Destinatarios del resumen semanal: email confirmado, resumen activado y al menos una posición.
create or replace function public.weekly_digest_recipients()
returns table (user_id uuid, email text, portfolio_id uuid)
language sql
security definer
set search_path = ''
as $$
    select u.id, u.email::text, p.id
    from auth.users u
    join public.profiles pr on pr.id = u.id
    join public.portfolios p on p.user_id = u.id and p.kind = 'real'
    where pr.weekly_email
      and u.email is not null
      and u.email_confirmed_at is not null
      and exists (select 1 from public.portfolio_positions pp where pp.portfolio_id = p.id);
$$;

revoke all on function public.weekly_digest_recipients() from public, anon, authenticated;
grant execute on function public.weekly_digest_recipients() to service_role;

-- Métricas para mirar en Supabase (Table Editor / SQL Editor). Nadie más tiene acceso.
-- Embudo por semana: cuántos navegadores distintos llegaron a cada paso.
create or replace view public.metricas_embudo_semanal with (security_invoker = true) as
select
    date_trunc('week', created_at)::date as semana,
    count(distinct anon_id) filter (where name = 'cartera_view')    as vieron_cartera,
    count(distinct anon_id) filter (where name = 'import_open')     as abrieron_importar,
    count(distinct anon_id) filter (where name = 'import_success')  as importaron,
    count(distinct anon_id) filter (where name = 'manual_add')      as cargaron_a_mano,
    count(distinct anon_id) filter (where name = 'demo_view')       as vieron_ejemplo,
    count(distinct anon_id) filter (where name = 'signup_cta')      as tocaron_registro,
    count(distinct anon_id) filter (where name = 'account_linked')  as se_registraron_o_ingresaron
from public.usage_events
group by 1
order by 1 desc;

-- Retención: de cada cohorte de registro (semana de alta), cuántos volvieron 1 y 4 semanas después.
create or replace view public.metricas_retencion with (security_invoker = true) as
with altas as (
    select id as user_id, created_at as alta from auth.users
),
actividad as (
    select user_id, created_at from public.usage_events where user_id is not null and name in ('cartera_view', 'email_visit')
)
select
    date_trunc('week', a.alta)::date as semana_de_alta,
    count(distinct a.user_id) as usuarios,
    count(distinct a.user_id) filter (where exists (
        select 1 from actividad x where x.user_id = a.user_id and x.created_at >= a.alta + interval '7 days' and x.created_at < a.alta + interval '14 days'
    )) as activos_semana_1,
    count(distinct a.user_id) filter (where exists (
        select 1 from actividad x where x.user_id = a.user_id and x.created_at >= a.alta + interval '28 days' and x.created_at < a.alta + interval '35 days'
    )) as activos_semana_4
from altas a
group by 1
order by 1 desc;

revoke all on public.metricas_embudo_semanal from anon, authenticated;
revoke all on public.metricas_retencion from anon, authenticated;
