import type { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { DatabaseProvider } from "./database-provider";
import { ThemeProvider } from "./theme-context";
import { UiLangProvider } from "./ui-lang-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider defaultTheme="system">
          <UiLangProvider>
            <DatabaseProvider>{children}</DatabaseProvider>
          </UiLangProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
