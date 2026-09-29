import { ScrollView } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import DrawerPanel, { useDrawerBottomSpace } from "@/UI/drawer-panel";

import SettingsAbout from "./settings-about";
import SettingsFontSize from "./settings-font-size";
import SettingsHijriAdjust from "./settings-hijri-adjust";
import SettingsLanguageOptions from "./settings-language-options";
import SettingsSection from "./settings-section";
import SettingsThemeToggle from "./settings-theme-toggle";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { t } = useSharedUiLang();
  const bottomSpace = useDrawerBottomSpace();

  return (
    <DrawerPanel open={open} onClose={onClose} title={t("settings")}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: bottomSpace }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title={t("uiLanguage")} subtitle={t("uiLanguageSub")}>
          <SettingsLanguageOptions />
        </SettingsSection>
        <SettingsSection title={t("theme")} subtitle={t("themeSub")}>
          <SettingsThemeToggle />
        </SettingsSection>
        <SettingsSection title={t("fontSize")} subtitle={t("fontSizeSub")}>
          <SettingsFontSize />
        </SettingsSection>
        <SettingsSection title={t("hijriAdjust")} subtitle={t("hijriAdjustSub")}>
          <SettingsHijriAdjust />
        </SettingsSection>
        <SettingsSection title={t("about")} subtitle={t("aboutSub")} style={{ marginBottom: 0 }}>
          <SettingsAbout />
        </SettingsSection>
      </ScrollView>
    </DrawerPanel>
  );
}
