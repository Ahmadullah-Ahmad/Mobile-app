import { Pressable, View } from "react-native";

import { useTheme } from "@/context/theme-context";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";
import Icon from "@/UI/icon";

import { THEME_OPTIONS } from "./settings-config";

export default function SettingsThemeToggle() {
  const palette = usePalette();
  const { t } = useSharedUiLang();
  const { theme, setTheme } = useTheme();

  return (
    <View style={{ flexDirection: "row", gap: 9 }}>
      {THEME_OPTIONS.map((option) => {
        const active = theme === option.value;
        const ink = active ? palette.onAccent : palette.themeOffInk;
        return (
          <Pressable
            key={option.value}
            onPress={() => setTheme(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 999,
              padding: 13,
              backgroundColor: active ? palette.accent : palette.themeOffBg,
            }}
          >
            <Icon name={option.icon} size={19} color={ink} />
            <AppText size={15} color={ink}>
              {t(option.labelKey)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
