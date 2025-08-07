import { useState } from "react";

export function useTheme(){
    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const [theme, setTheme] = useState(savedTheme);
    console.log(theme)

    const changeTheme = () => {
        setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark")
    }

    return [theme, changeTheme]
}