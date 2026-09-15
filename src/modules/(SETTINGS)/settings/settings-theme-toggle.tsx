import { Ionicons } from "@expo/vector-icons";
import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/context/theme-context";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { ACCENT_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { THEME_OPTIONS } from "./settings-config";

export default function SettingsThemeToggle() {
  const { t } = useSharedUiLang();
  const { theme, setTheme } = useTheme();

  return (
    <View className="bg-card border border-border rounded-2xl flex-row overflow-hidden">
      {THEME_OPTIONS.map((option, index) => {
        const active = theme === option.value;
        return (
          <Fragment key={option.value}>
            {index > 0 ? <View className="w-px bg-border" /> : null}
            <Pressable
              onPress={() => setTheme(option.value)}
              className={cn(
                "flex-1 flex-row items-center justify-center gap-2 py-4",
                active && "bg-primary/10"
              )}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={active ? ACCENT_COLOR : "gray"}
              />
              <Text
                className={active ? "text-primary font-semibold" : "text-muted-foreground"}
              >
                {t(option.labelKey)}
              </Text>
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}
