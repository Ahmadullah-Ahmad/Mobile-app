import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";

import SettingsFontSize from "./settings-font-size";
import SettingsLanguageSelect from "./settings-language-select";
import SettingsSection from "./settings-section";
import SettingsThemeToggle from "./settings-theme-toggle";

export default function SettingsView() {
  const { t } = useSharedUiLang();
  const { flexRow, chevronBack, textAlign } = useDirection();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View style={{ flexDirection: flexRow }} className="px-5 pt-2 pb-4 items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:opacity-80"
        >
          <Ionicons name={chevronBack} size={22} color="gray" />
        </Pressable>
        <Text className="text-foreground text-2xl font-semibold" style={{ textAlign }}>
          {t("settings")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        <SettingsSection title={t("uiLanguage")} subtitle={t("uiLanguageSub")}>
          <SettingsLanguageSelect />
        </SettingsSection>
        <SettingsSection title={t("theme")} subtitle={t("themeSub")}>
          <SettingsThemeToggle />
        </SettingsSection>
        <SettingsSection title={t("fontSize")} subtitle={t("fontSizeSub")}>
          <SettingsFontSize />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
