import { createContext, useEffect, useState } from "react"

export const ThemeContext = createContext()

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

    const toggleTheme = () => {
        if(theme === 'light') {
            localStorage.setItem('theme', 'dark')
            setTheme('dark')
        } else {
            localStorage.setItem('theme', 'light')
            setTheme('light')
        }
    }

    useEffect(() => {
        if(theme === 'light') {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
        } else if(theme === 'dark') {
            document.documentElement.classList.remove('light')
            document.documentElement.classList.add('dark')
        }
    }, [theme])

    return (
        <ThemeContext.Provider value={[theme, toggleTheme]}>
            {children}
        </ThemeContext.Provider>
    )
}