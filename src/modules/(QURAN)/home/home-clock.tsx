import { View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useNow } from "@/hooks/use-now";
import { usePalette } from "@/hooks/use-palette";
import { formatGregorianDate } from "@/lib/calendar";
import { useTimeFormat } from "@/modules/(PRAYER)/prayer-times/prayer-hooks";
import AppText from "@/UI/app-text";
import Icon from "@/UI/icon";

export default function HomeClock() {
  const palette = usePalette();
  const { lang, formatNumber } = useSharedUiLang();
  const now = useNow();
  const { formatTime, toLocalDate } = useTimeFormat();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 28,
        backgroundColor: palette.panel,
        marginBottom: 14,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.accentSoft,
        }}
      >
        <Icon name="clock" size={22} color={palette.accentStrong} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="uiMedium" size={26} lineHeight={1.35} align="start">
          {formatTime(now)}
        </AppText>
        <AppText size={13} color={palette.ink2} align="start">
          {formatGregorianDate(toLocalDate(now), lang, formatNumber)}
        </AppText>
      </View>
    </View>
  );
}
