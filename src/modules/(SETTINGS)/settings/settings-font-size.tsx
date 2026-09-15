import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/context/theme-context";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { MAX_FONT_SIZE, MIN_FONT_SIZE, useFontSize } from "@/hooks/use-font-size";

import { PREVIEW_ARABIC, PREVIEW_TRANSLATION } from "./settings-config";

function StepButton({
  icon,
  onPress,
  disabled,
}: {
  icon: "add" | "remove";
  onPress: () => void;
  disabled: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-11 h-11 rounded-full bg-muted items-center justify-center active:opacity-70"
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Ionicons name={icon} size={22} color={theme === "light" ? "black" : "gray"} />
    </Pressable>
  );
}

export default function SettingsFontSize() {
  const { t } = useSharedUiLang();
  const { fontSize, increase, decrease } = useFontSize();

  return (
    <>
      <View className="bg-card border border-border rounded-2xl px-5 py-4 flex-row items-center justify-between">
        <StepButton icon="remove" onPress={decrease} disabled={fontSize <= MIN_FONT_SIZE} />
        <View className="items-center">
          <Text className="text-foreground text-2xl font-semibold">{fontSize}</Text>
          <Text className="text-muted-foreground text-xs">
            {MIN_FONT_SIZE}–{MAX_FONT_SIZE}
          </Text>
        </View>
        <StepButton icon="add" onPress={increase} disabled={fontSize >= MAX_FONT_SIZE} />
      </View>

      <View className="bg-card border border-border rounded-2xl px-4 py-4 mt-2">
        <Text className="text-muted-foreground text-xs mb-2">{t("preview")}</Text>
        <Text
          style={{
            fontFamily: "AmiriQuran",
            fontSize: fontSize + 4,
            lineHeight: (fontSize + 4) * 2.2,
            textAlign: "center",
            writingDirection: "rtl",
          }}
          className="text-foreground"
        >
          {PREVIEW_ARABIC}
        </Text>
        <Text
          style={{
            fontSize: fontSize - 2,
            lineHeight: (fontSize - 2) * 1.8,
            textAlign: "right",
            writingDirection: "rtl",
          }}
          className="text-muted-foreground mt-2"
        >
          {PREVIEW_TRANSLATION}
        </Text>
      </View>
    </>
  );
}
