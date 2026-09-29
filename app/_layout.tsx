import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { I18nManager, LogBox } from "react-native";

import View from "@/components/ui/view";
import { AppProviders } from "@/context/app-providers";
import { useTheme } from "@/context/theme-context";
import { resetDatabaseIfOutdated } from "@/db/db-version";
import { FONT_ASSETS } from "@/lib/fonts";
import { PALETTE } from "@/lib/palette";
import "./global.css";

// Allow per-component RTL on Android (writingDirection style).
I18nManager.allowRTL(true);
LogBox.ignoreLogs(["Unable to activate keep awake"]);
SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  const { theme } = useTheme();
  const ground = PALETTE[theme].ground;

  // The native window sits behind every screen; keep it on the app background so no white shows through.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(ground);
  }, [ground]);

  return (
    <View className="flex-1">
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: ground } }} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FONT_ASSETS);

  const [dbChecked, setDbChecked] = useState(false);
  useEffect(() => {
    resetDatabaseIfOutdated()
      .catch((e) => console.error("Database version check failed:", e))
      .finally(() => setDbChecked(true));
  }, []);

  // The splash screen covers this, so returning null shows no blank frame.
  if (!fontsLoaded || !dbChecked) return null;

  return (
    <AppProviders>
      <ThemedStack />
    </AppProviders>
  );
}
