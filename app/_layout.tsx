import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Allow per-component RTL on Android (writingDirection style).
I18nManager.allowRTL(true);
import {
  SafeAreaProvider,
  initialWindowMetrics
} from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { ThemeProvider, useTheme } from '@/theme';
import { UiLangProvider } from '@/lib/i18n-provider';
import View from '@/components/ui/view';
import './global.css';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Unable to activate keep awake']);

SplashScreen.preventAutoHideAsync();

/** Inner shell — lives inside ThemeProvider so it can read the current theme */
function ThemedApp() {
  const { theme } = useTheme();

  return (
    <View className="flex-1">
      <StatusBar
        style={theme === 'dark' ? 'light' : 'dark'}
        translucent
        backgroundColor="transparent"
      />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'AmiriQuran': require('../assets/fonts/AmiriQuran.ttf'),
    'Amiri': require('../assets/fonts/Amiri-Regular.ttf'),
  });
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider defaultTheme="system">
          <UiLangProvider>
            <ThemedApp />
          </UiLangProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
