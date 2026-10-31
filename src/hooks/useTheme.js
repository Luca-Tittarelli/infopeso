'use client';

import { useSyncExternalStore, useCallback, useEffect } from 'react';

// Singleton global state — Oscuro primero según manual de marca
let currentTheme = 'dark';
const listeners = new Set();

function emitChange() {
    listeners.forEach((listener) => listener());
}

function subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function getSnapshot() {
    if (typeof window === 'undefined') return 'dark';
    return currentTheme;
}

function getServerSnapshot() {
    return 'dark';
}

function applyThemeToDOM(theme) {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Client-side initialization
if (typeof window !== 'undefined') {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') {
            currentTheme = saved;
        } else if (document.documentElement.getAttribute('data-theme') === 'light') {
            currentTheme = 'light';
        } else {
            currentTheme = 'dark';
        }
        applyThemeToDOM(currentTheme);
    } catch (e) {}

    window.addEventListener('storage', (e) => {
        if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
            setGlobalTheme(e.newValue);
        }
    });
}

export function setGlobalTheme(nextTheme) {
    if (nextTheme !== 'dark' && nextTheme !== 'light') return;
    currentTheme = nextTheme;
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('theme', nextTheme);
            applyThemeToDOM(nextTheme);
        } catch (e) {}
    }
    emitChange();
}

export function toggleTheme() {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setGlobalTheme(next);
}

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

export function useTheme() {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const mounted = useSyncExternalStore(emptySubscribe, getClientMounted, getServerMounted);

    useEffect(() => {
        applyThemeToDOM(currentTheme);
    }, []);

    const changeTheme = useCallback(() => {
        toggleTheme();
    }, []);

    return [theme, changeTheme, mounted];
}
