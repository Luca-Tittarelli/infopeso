'use client';

import { useState, useEffect } from "react";

export function useTheme() {
    // We initialize theme to "dark" as default (or light) for the server-side render,
    // then sync with localStorage / system settings on the client in useEffect.
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        // Run only on client
        const savedTheme = localStorage.getItem("theme");
        const defaultTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setTheme(defaultTheme);
    }, []);

    const changeTheme = () => {
        setTheme(prevTheme => {
            const nextTheme = prevTheme === "dark" ? "light" : "dark";
            localStorage.setItem("theme", nextTheme);
            document.documentElement.classList.toggle("dark", nextTheme === "dark");
            return nextTheme;
        });
    };

    return [theme, changeTheme];
}
