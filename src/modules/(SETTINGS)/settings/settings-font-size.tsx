import { View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { MAX_FONT_SIZE, MIN_FONT_SIZE, useFontSize } from "@/hooks/use-font-size";
import { usePalette } from "@/hooks/use-palette";
import { BISMILLAH_TEXT } from "@/lib/constants";
import AppText from "@/UI/app-text";
import IconButton from "@/UI/icon-button";

import { PREVIEW_TRANSLATION } from "./settings-config";

export default function SettingsFontSize() {
  const palette = usePalette();
  const { t, formatNumber } = useSharedUiLang();
  const { fontSize, increase, decrease } = useFontSize();

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: palette.panel,
          borderRadius: 30,
          paddingVertical: 14,
          paddingHorizontal: 18,
          marginBottom: 12,
        }}
      >
        <IconButton
          icon="minus"
          iconSize={20}
          onPress={decrease}
          accessibilityLabel={t("decrease")}
          backgroundColor={palette.ground}
        />
        <View style={{ alignItems: "center" }}>
          <AppText variant="heading" size={24} lineHeight={1.3}>
            {formatNumber(fontSize)}
          </AppText>
          <AppText size={11.5} color={palette.ink2}>
            {`${formatNumber(MIN_FONT_SIZE)}–${formatNumber(MAX_FONT_SIZE)}`}
          </AppText>
        </View>
        <IconButton
          icon="plus"
          iconSize={20}
          onPress={increase}
          accessibilityLabel={t("increase")}
          backgroundColor={palette.ground}
        />
      </View>

      <View style={{ backgroundColor: palette.panel, borderRadius: 30, padding: 18 }}>
        <AppText size={11.5} color={palette.ink2} style={{ marginBottom: 10 }}>
          {t("preview")}
        </AppText>
        <AppText
          variant="quran"
          size={fontSize + 4}
          lineHeight={2.1}
          color={palette.goldText}
          align="center"
          style={{ marginBottom: 8 }}
        >
          {BISMILLAH_TEXT}
        </AppText>
        <AppText variant="naskh" size={fontSize - 2} lineHeight={1.8} color={palette.ink2} align="right">
          {PREVIEW_TRANSLATION}
        </AppText>
      </View>
    </>
  );
}
