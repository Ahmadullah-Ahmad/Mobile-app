import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { themes } from './themes';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    activeTheme: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    defaultTheme = 'system'
}: {
    children: React.ReactNode;
    defaultTheme?: 'light' | 'dark' | 'system';
}) {
    const systemColorScheme = useNativeColorScheme() as ThemeType || 'light';
    const [theme, setTheme] = useState<ThemeType>(
        defaultTheme === 'system' ? systemColorScheme : defaultTheme as ThemeType
    );
    const { colorScheme, setColorScheme } = useNativewindColorScheme();

    useEffect(() => {
        if (colorScheme !== theme) setColorScheme(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, colorScheme]);

    const activeTheme = themes[theme];

    const value = useMemo(
        () => ({ theme, setTheme, activeTheme }),
        [theme, activeTheme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}