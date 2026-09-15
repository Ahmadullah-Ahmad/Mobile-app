import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useTheme } from "@/context/theme-context";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { UI_LANG_LABELS, UI_LANGS } from "@/i18n/config";

export default function SettingsLanguageSelect() {
  const { lang, setLang } = useSharedUiLang();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const iconColor = theme === "light" ? "#000" : "#fff";

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <DropdownTrigger>
        <View className="bg-card border border-border rounded-2xl px-5 py-4 flex-row items-center justify-between">
          <Text className="text-foreground text-base">{UI_LANG_LABELS[lang]}</Text>
          <Ionicons name="chevron-down" size={18} color={iconColor} />
        </View>
      </DropdownTrigger>
      <DropdownContent align="center">
        {UI_LANGS.map((option) => (
          <DropdownItem
            key={option}
            icon="language-outline"
            onSelect={() => setLang(option)}
            shortcut={lang === option ? "✓" : undefined}
            iconColor={iconColor}
          >
            {UI_LANG_LABELS[option]}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
