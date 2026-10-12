import { Pressable, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import { UI_LANG_LABELS, UI_LANGS } from "@/i18n/config";
import AppText from "@/UI/app-text";
import Icon from "@/UI/icon";

const ROW_HEIGHT = 50;

export default function SettingsLanguageOptions() {
  const palette = usePalette();
  const { lang, setLang } = useSharedUiLang();

  return (
    <View style={{ gap: 8 }}>
      {UI_LANGS.map((option) => {
        const selected = lang === option;
        return (
          <Pressable
            key={option}
            onPress={() => setLang(option)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: selected ? palette.accentSoft : "transparent",
              borderWidth: 1,
              borderColor: selected ? palette.accentBorder : palette.optionBorder,
              height: ROW_HEIGHT,
              borderRadius: ROW_HEIGHT / 2,
              paddingHorizontal: 18,
            }}
          >
            <AppText
              variant={option === "english" ? "latin" : "naskh"}
              size={15.5}
              style={{ flex: 1 }}
            >
              {UI_LANG_LABELS[option]}
            </AppText>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                overflow: "hidden",
                backgroundColor: selected ? palette.accent : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected ? (
                <Icon name="check" size={12} strokeWidth={3.2} color={palette.onAccent} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
