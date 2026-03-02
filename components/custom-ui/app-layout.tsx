import { ThemeToggle } from '@/components/custom-ui/theme-toggle';
import { Header } from '@/components/custom-ui/header';
import { SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import { View } from 'react-native';
import { AppSidebar } from './main-sidebar';
import { useTheme } from '@/contexts/theme-context';

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBackButton?: boolean;
}

export function AppLayout({
    children,
    title = 'App',
    showBackButton = true
}: AppLayoutProps) {
    const { activeTheme } = useTheme();

    return (
        <View style={activeTheme} className="flex-1 bg-background">
            {/* Header with menu trigger and theme toggle */}
            <Header
                title={title}
                showBackButton={true}
                rightContent={
                    <View className="flex-row items-center gap-2">
                        <ThemeToggle />
                        <SidebarTrigger />
                    </View>
                }
            />

            {/* Main content area */}
            <View className="flex-1">
                {children}
            </View>

            {/* Sidebar (will be shown as sheet/drawer) */}
            <AppSidebar />
        </View>
    );
}

