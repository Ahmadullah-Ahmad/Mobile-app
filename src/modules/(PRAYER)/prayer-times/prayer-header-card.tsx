import { Pressable, View } from "react-native";

import { useAppSheet } from "@/context/sheet-context";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useHijriAdjust } from "@/hooks/use-hijri-adjust";
import { useNow } from "@/hooks/use-now";
import { usePalette } from "@/hooks/use-palette";
import { formatHijriDate, formatSolarDate } from "@/lib/calendar";
import { navigate, ROUTES } from "@/lib/routes";
import AppText from "@/UI/app-text";
import Icon from "@/UI/icon";

import type { PrayerMoment } from "./prayer-calc";
import { PRAYER_LABEL } from "./prayer-config";
import { usePrayerLocation, usePrayerMoments, useTimeFormat } from "./prayer-hooks";

function MomentColumn({ label, moment, extra, highlight }: { label: string; moment: PrayerMoment; extra?: string; highlight?: boolean }) {
  const palette = usePalette();
  const { t } = useSharedUiLang();
  const { formatTime } = useTimeFormat();

  return (
    <View style={{ flex: 1, gap: 1 }}>
      <AppText size={12} color={palette.prayerInk2} align="start">
        {label}
      </AppText>
      <AppText variant="uiMedium" size={19} lineHeight={1.45} color={highlight ? palette.prayerAccent : palette.prayerInk} align="start">
        {t(PRAYER_LABEL[moment.name])}
      </AppText>
      <AppText size={13.5} color={palette.prayerInk} align="start">
        {formatTime(moment.time)}
      </AppText>
      {extra ? (
        <AppText size={12} color={palette.prayerAccent} align="start">
          {extra}
        </AppText>
      ) : null}
    </View>
  );
}

export default function PrayerHeaderCard() {
  const palette = usePalette();
  const { t, lang, formatNumber } = useSharedUiLang();
  const { openSheet } = useAppSheet();
  const now = useNow();
  const { adjust } = useHijriAdjust();
  const { location } = usePrayerLocation();
  const { current, next } = usePrayerMoments(now);
  const { formatCountdown, toLocalDate } = useTimeFormat();

  return (
    <Pressable
      onPress={() => navigate(ROUTES.prayer)}
      accessibilityRole="button"
      className="active:opacity-90"
      style={{ overflow: "hidden", backgroundColor: palette.prayerBg, borderRadius: 36, padding: 20, marginBottom: 16 }}
    >
      <View style={{ position: "absolute", right: -50, top: -70, width: 170, height: 170, borderRadius: 85, backgroundColor: palette.prayerChip }} />

      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <AppText variant="uiMedium" size={15} color={palette.prayerInk} align="start">
            {formatHijriDate(toLocalDate(now), lang, formatNumber, adjust)}
          </AppText>
          <AppText size={12.5} color={palette.prayerInk2} align="start">
            {formatSolarDate(toLocalDate(now), lang, formatNumber)}
          </AppText>
        </View>
        <Pressable
          onPress={() => openSheet("prayerCity")}
          accessibilityRole="button"
          accessibilityLabel={t("changeCity")}
          className="active:opacity-70"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            minHeight: 36,
            paddingHorizontal: 12,
            borderRadius: 999,
            backgroundColor: palette.prayerChip,
            maxWidth: "45%",
          }}
        >
          <Icon name="pin" size={15} color={palette.prayerAccent} strokeWidth={2.4} />
          <AppText size={12.5} color={palette.prayerInk} numberOfLines={1} style={{ flexShrink: 1 }}>
            {location.label}
          </AppText>
        </Pressable>
      </View>

      {current && next ? (
        <View style={{ flexDirection: "row", gap: 16 }}>
          <MomentColumn label={t("prayerNow")} moment={current} highlight />
          <View style={{ width: 1, backgroundColor: palette.prayerChip }} />
          <MomentColumn label={t("prayerNext")} moment={next} extra={formatCountdown(now, next.time)} />
        </View>
      ) : null}
    </Pressable>
  );
}
