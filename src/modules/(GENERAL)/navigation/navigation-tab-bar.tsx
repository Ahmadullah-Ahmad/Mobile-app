import { usePathname } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppSheet } from "@/context/sheet-context";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import { navigate } from "@/lib/routes";
import AppText from "@/UI/app-text";
import Icon from "@/UI/icon";

import { screenTabFor, TAB_ITEMS } from "./navigation-config";

export default function NavigationTabBar() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { t } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { sheet, openSheet, closeSheet } = useAppSheet();
  const screenTab = screenTabFor(pathname);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 10,
        paddingHorizontal: 6,
        paddingBottom: Math.max(insets.bottom, 10),
        backgroundColor: palette.ground,
        borderTopWidth: 1,
        borderTopColor: palette.edge,
        direction: writingDirection,
      }}
    >
      {TAB_ITEMS.map((item) => {
        const active = item.kind === "screen" ? screenTab === item.key : sheet === item.key;
        const color = active ? palette.accent : palette.tabOff;

        const onPress = () => {
          if (item.kind === "screen") {
            closeSheet();
            navigate(item.path);
          } else {
            openSheet(item.key);
          }
        };

        return (
          <Pressable
            key={item.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ flex: 1, alignItems: "center", gap: 4, paddingVertical: 4 }}
          >
            <Icon name={item.icon} size={23} color={color} />
            <AppText size={11.5} lineHeight={1.3} color={color}>
              {t(item.labelKey)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
