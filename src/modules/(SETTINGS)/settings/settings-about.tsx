import Constants from "expo-constants";
import { Fragment } from "react";
import { Linking, Pressable, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";

import { ABOUT_CREDITS, CONTACT_PHONE } from "./settings-config";

function AboutRow({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const palette = usePalette();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "link" : undefined}
      className={onPress ? "active:opacity-70" : undefined}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: palette.edge,
      }}
    >
      <AppText size={13} color={palette.ink2}>
        {label}
      </AppText>
      <AppText
        variant={onPress ? "latin" : "uiMedium"}
        size={14}
        color={onPress ? palette.accentText : palette.ink}
        align="end"
        style={{ flexShrink: 1, textDecorationLine: onPress ? "underline" : "none" }}
      >
        {value}
      </AppText>
    </Pressable>
  );
}

export default function SettingsAbout() {
  const palette = usePalette();
  const { t, lang } = useSharedUiLang();
  const version = Constants.expoConfig?.version ?? "";

  return (
    <View style={{ backgroundColor: palette.panel, borderRadius: 30, paddingHorizontal: 18, paddingVertical: 6 }}>
      {ABOUT_CREDITS.map((credit) => (
        <Fragment key={credit.labelKey}>
          <AboutRow label={t(credit.labelKey)} value={lang === "english" ? credit.nameEn : credit.name} />
          <AboutRow
            label={t("aboutEmail")}
            value={credit.email}
            onPress={() => Linking.openURL(`mailto:${credit.email}`)}
          />
        </Fragment>
      ))}
      <AboutRow
        label={t("aboutPhone")}
        value={`\u2066${CONTACT_PHONE}\u2069`}
        onPress={() => Linking.openURL(`tel:${CONTACT_PHONE}`)}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 }}>
        <AppText size={13} color={palette.ink2}>
          {t("aboutVersion")}
        </AppText>
        <AppText variant="latin" size={13} color={palette.ink2}>
          {version}
        </AppText>
      </View>
    </View>
  );
}
