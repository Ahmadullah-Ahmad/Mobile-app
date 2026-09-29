import { Alert, Linking, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppSheet } from "@/context/sheet-context";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { useHijriAdjust } from "@/hooks/use-hijri-adjust";
import { useNow } from "@/hooks/use-now";
import { usePalette } from "@/hooks/use-palette";
import { formatHijriDate, formatSolarDate } from "@/lib/calendar";
import AppText from "@/UI/app-text";
import IconButton from "@/UI/icon-button";
import ScreenTransition from "@/UI/screen-transition";
import ToolHeader from "@/UI/tool-header";

import { isAlertPrayer, PRAYER_LABEL, PRAYER_ORDER, type AlertPrayer } from "./prayer-config";
import { usePrayerAlerts, usePrayerLocation, usePrayerMoments, useTimeFormat } from "./prayer-hooks";
import { requestAlertPermission } from "./prayer-notifications";
import PrayerRow from "./prayer-row";

export default function PrayerView() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t, lang, formatNumber } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { openSheet } = useAppSheet();
  const now = useNow();
  const { adjust } = useHijriAdjust();
  const { location } = usePrayerLocation();
  const { today, current, next, currentIsToday } = usePrayerMoments(now);
  const { alerts, toggleAlert } = usePrayerAlerts();
  const { formatCountdown, toLocalDate } = useTimeFormat();

  const onToggleAlert = async (prayer: AlertPrayer) => {
    const enable = !alerts[prayer];
    if (enable && !(await requestAlertPermission())) {
      Alert.alert(t("alertsBlocked"), t("alertsBlockedMsg"), [
        { text: t("cancel"), style: "cancel" },
        { text: t("openSettings"), onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    toggleAlert(prayer, enable);
  };

  return (
    <ScreenTransition style={{ flex: 1, backgroundColor: palette.ground, paddingTop: insets.top + 4, direction: writingDirection }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <ToolHeader
          title={t("prayerTimes")}
          subtitle={location.label}
          action={
            <IconButton icon="pin" iconSize={19} onPress={() => openSheet("prayerCity")} accessibilityLabel={t("changeCity")} />
          }
        />

        <View style={{ backgroundColor: palette.prayerBg, borderRadius: 30, padding: 18, marginBottom: 16, alignItems: "center" }}>
          <AppText variant="uiMedium" size={15} color={palette.prayerInk} align="center">
            {formatHijriDate(toLocalDate(now), lang, formatNumber, adjust)}
          </AppText>
          <AppText size={12.5} color={palette.prayerInk2} align="center" style={{ marginBottom: next ? 10 : 0 }}>
            {formatSolarDate(toLocalDate(now), lang, formatNumber)}
          </AppText>
          {next ? (
            <AppText size={14} color={palette.prayerAccent} align="center">
              {`${t("prayerNext")}: ${t(PRAYER_LABEL[next.name])} · ${formatCountdown(now, next.time)}`}
            </AppText>
          ) : null}
        </View>

        <View style={{ gap: 8 }}>
          {PRAYER_ORDER.map((name) => (
            <PrayerRow
              key={name}
              name={name}
              time={today[name]}
              active={currentIsToday && current?.name === name}
              alertOn={isAlertPrayer(name) ? !!alerts[name] : undefined}
              onToggleAlert={isAlertPrayer(name) ? () => onToggleAlert(name) : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenTransition>
  );
}
