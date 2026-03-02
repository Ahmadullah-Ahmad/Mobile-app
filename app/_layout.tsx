import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  initialWindowMetrics
} from 'react-native-safe-area-context';
import { ThemeProvider, } from '@/contexts/theme-context';
import './global.css';
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider defaultTheme="system">
        <StatusBar />
        <Slot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

