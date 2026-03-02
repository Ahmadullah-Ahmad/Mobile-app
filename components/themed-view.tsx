import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

interface ThemedViewProps extends React.ComponentProps<typeof View> {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedView({
  className,
  lightColor,
  darkColor,
  style,
  ...props
}: ThemedViewProps) {
  const { activeTheme, theme } = useTheme();
  
  const backgroundColor = theme === 'light' ? lightColor : darkColor;
  
  return (
    <View
      style={[activeTheme, backgroundColor ? { backgroundColor } : undefined, style]}
      className={cn('bg-background', className)}
      {...props}
    />
  );
}

