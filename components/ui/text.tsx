import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Text } from 'react-native';

interface ThemedTextProps extends React.ComponentProps<typeof Text> {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'title' | 'subtitle' | 'link' | 'defaultSemiBold';
}

export default function ThemedText({
    className,
    lightColor,
    darkColor,
    type = 'default',
    style,
    ...props
}: ThemedTextProps) {
    const { theme } = useTheme();

    const color = theme === 'light' ? lightColor : darkColor;

    const typeClassName = {
        default: 'text-base text-foreground',
        title: 'text-3xl font-bold text-foreground',
        subtitle: 'text-xl font-semibold text-foreground',
        link: 'text-base text-primary underline',
        defaultSemiBold: 'text-base font-semibold text-foreground',
    }[type];

    return (
        <Text
            style={[color ? { color } : undefined, style]}
            className={cn(typeClassName, className)}
            {...props}
        />
    );
}

