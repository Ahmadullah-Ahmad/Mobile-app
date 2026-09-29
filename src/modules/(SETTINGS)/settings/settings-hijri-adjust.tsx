import { View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { MAX_HIJRI_ADJUST, useHijriAdjust } from "@/hooks/use-hijri-adjust";
import { usePalette } from "@/hooks/use-palette";
import { formatHijriDate } from "@/lib/calendar";
import AppText from "@/UI/app-text";
import IconButton from "@/UI/icon-button";

export default function SettingsHijriAdjust() {
  const palette = usePalette();
  const { t, lang, formatNumber } = useSharedUiLang();
  const { adjust, increase, decrease } = useHijriAdjust();
  const sign = adjust > 0 ? "+" : adjust < 0 ? "−" : "";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: palette.panel,
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 18,
      }}
    >
      <IconButton
        icon="minus"
        iconSize={20}
        onPress={decrease}
        accessibilityLabel={t("decrease")}
        backgroundColor={palette.ground}
        style={{ opacity: adjust <= -MAX_HIJRI_ADJUST ? 0.4 : 1 }}
      />
      <View style={{ alignItems: "center", flex: 1 }}>
        <AppText variant="uiMedium" size={14.5} align="center">
          {formatHijriDate(new Date(), lang, formatNumber, adjust)}
        </AppText>
        <AppText size={11.5} color={palette.ink2} align="center">
          {t("hijriAdjustDays", { days: `${sign}${formatNumber(Math.abs(adjust))}` })}
        </AppText>
      </View>
      <IconButton
        icon="plus"
        iconSize={20}
        onPress={increase}
        accessibilityLabel={t("increase")}
        backgroundColor={palette.ground}
        style={{ opacity: adjust >= MAX_HIJRI_ADJUST ? 0.4 : 1 }}
      />
    </View>
  );
}
