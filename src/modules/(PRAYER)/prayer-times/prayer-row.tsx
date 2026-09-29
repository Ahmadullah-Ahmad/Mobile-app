import { Pressable, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";
import Icon from "@/UI/icon";

import { PRAYER_LABEL, type PrayerName } from "./prayer-config";
import { useTimeFormat } from "./prayer-hooks";

interface PrayerRowProps {
  name: PrayerName;
  time: Date;
  active: boolean;
  alertOn?: boolean;
  onToggleAlert?: () => void;
}

export default function PrayerRow({ name, time, active, alertOn, onToggleAlert }: PrayerRowProps) {
  const palette = usePalette();
  const { t } = useSharedUiLang();
  const { formatTime } = useTimeFormat();
  const ink = active ? palette.onAccent : palette.ink;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 60,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 24,
        backgroundColor: active ? palette.accent : palette.panel,
      }}
    >
      <AppText variant="uiMedium" size={16} color={ink} align="start" style={{ flex: 1 }}>
        {t(PRAYER_LABEL[name])}
      </AppText>
      <AppText size={15} color={ink}>
        {formatTime(time)}
      </AppText>
      {onToggleAlert ? (
        <Pressable
          onPress={onToggleAlert}
          accessibilityRole="switch"
          accessibilityState={{ checked: !!alertOn }}
          accessibilityLabel={t("prayerAlertToggle", { prayer: t(PRAYER_LABEL[name]) })}
          className="active:opacity-70"
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", marginEnd: -10 }}
        >
          <Icon
            name="bell"
            size={20}
            strokeWidth={2.2}
            color={alertOn ? (active ? palette.onAccent : palette.accent) : active ? palette.onAccent : palette.tabOff}
            fill={alertOn ? (active ? palette.onAccent : palette.accent) : "none"}
          />
        </Pressable>
      ) : (
        <View style={{ width: 34 }} />
      )}
    </View>
  );
}
