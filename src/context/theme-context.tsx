import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { loadSetting, peekSetting, saveSetting } from '@/lib/settings';
import { themes } from '@/lib/themes';

type ThemeType = 'light' | 'dark';

const THEME_SETTING_KEY = 'theme';

const isThemeType = (value: unknown): value is ThemeType => value === 'light' || value === 'dark';

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
    const fallbackTheme = defaultTheme === 'system' ? systemColorScheme : defaultTheme;

    // The settings cache is filled before the first screen renders, so a saved choice applies immediately.
    const [theme, setThemeState] = useState<ThemeType>(() => {
        const saved = peekSetting<unknown>(THEME_SETTING_KEY);
        return isThemeType(saved) ? saved : fallbackTheme;
    });

    useEffect(() => {
        if (peekSetting(THEME_SETTING_KEY) !== undefined) return;
        loadSetting<unknown>(THEME_SETTING_KEY).then((saved) => {
            if (isThemeType(saved)) setThemeState(saved);
        });
    }, []);

    const setTheme = useCallback((next: ThemeType) => {
        setThemeState(next);
        saveSetting(THEME_SETTING_KEY, next);
    }, []);

    const { colorScheme, setColorScheme } = useNativewindColorScheme();

    useEffect(() => {
        if (colorScheme !== theme) setColorScheme(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, colorScheme]);

    const activeTheme = themes[theme];

    const value = useMemo(
        () => ({ theme, setTheme, activeTheme }),
        [theme, setTheme, activeTheme]
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