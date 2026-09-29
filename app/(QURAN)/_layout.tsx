import { Tabs } from "expo-router";
import { View } from "react-native";

import { SheetProvider } from "@/context/sheet-context";
import { usePalette } from "@/hooks/use-palette";
import NavigationSheets from "@/modules/(GENERAL)/navigation/navigation-sheets";
import NavigationTabBar from "@/modules/(GENERAL)/navigation/navigation-tab-bar";
import { useAutoLocate } from "@/modules/(PRAYER)/prayer-times/prayer-hooks";
import { usePrayerAlertSync } from "@/modules/(PRAYER)/prayer-times/prayer-notifications";

export const unstable_settings = {
  initialRouteName: "index",
};

function PrayerBackground() {
  useAutoLocate();
  usePrayerAlertSync();
  return null;
}

export default function QuranTabsLayout() {
  const palette = usePalette();

  return (
    <SheetProvider>
      <View style={{ flex: 1, backgroundColor: palette.ground }}>
        <Tabs
          backBehavior="history"
          tabBar={() => <NavigationTabBar />}
          screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: palette.ground } }}
        />
        <NavigationSheets />
        <PrayerBackground />
      </View>
    </SheetProvider>
  );
}
