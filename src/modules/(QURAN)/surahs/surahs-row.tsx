import { View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";
import CardRow from "@/UI/card-row";
import NumberBadge from "@/UI/number-badge";

import { SURAH_ROW_VARIANTS, type Surah } from "./surahs-config";

interface SurahsRowProps {
  surah: Surah;
  variant?: keyof typeof SURAH_ROW_VARIANTS;
  onPress: (surah: Surah) => void;
}

export default function SurahsRow({ surah, variant = "full", onPress }: SurahsRowProps) {
  const palette = usePalette();
  const { t, lang, formatNumber } = useSharedUiLang();
  const v = SURAH_ROW_VARIANTS[variant];
  const verses = `${formatNumber(surah.total_verses)} ${t("ayat")}`;
  const place = t(surah.revelation_type);
  const meccan = surah.revelation_type === "meccan";

  return (
    <CardRow
      radius={v.radius}
      paddingVertical={v.paddingVertical}
      paddingHorizontal={v.paddingHorizontal}
      gap={13}
      onPress={() => onPress(surah)}
    >
      <NumberBadge
        label={formatNumber(surah.number)}
        size={v.badge}
        fontSize={v.badgeFont}
        backgroundColor={palette.ground}
      />

      {variant === "compact" ? (
        <>
          <AppText variant="amiri" size={v.name} align="start" style={{ flex: 1 }}>
            {surah.name_arabic}
          </AppText>
          <AppText size={12} color={palette.ink2}>
            {`${verses} · ${place}`}
          </AppText>
        </>
      ) : (
        <>
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="amiri" size={v.name} align="start">
              {surah.name_arabic}
            </AppText>
            <AppText size={12.5} color={palette.ink2} align="start" style={{ marginTop: 1 }}>
              {lang === "dari" ? surah.name_dari : surah.name_pashto}
            </AppText>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <AppText size={12} color={palette.ink2}>
              {verses}
            </AppText>
            <View
              style={{
                marginTop: 4,
                paddingVertical: 2,
                paddingHorizontal: 9,
                borderRadius: 999,
                backgroundColor: meccan ? palette.accentSoft : palette.sageSoft,
              }}
            >
              <AppText size={11} color={meccan ? palette.accentStrong : palette.sageStrong}>
                {place}
              </AppText>
            </View>
          </View>
        </>
      )}
    </CardRow>
  );
}
