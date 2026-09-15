import { Pressable, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import { SURAH_PREFIX } from "@/lib/constants";
import { navigate } from "@/lib/routes";
import AppText from "@/UI/app-text";
import PillButton from "@/UI/pill-button";

import type { ContinueReading } from "./home-config";

export default function HomeContinueCard({ reading }: { reading: ContinueReading }) {
  const palette = usePalette();
  const { t } = useSharedUiLang();
  const { surah, verseNumber, juzNumber, route } = reading;
  if (!surah) return null;

  const progress = Math.min(100, Math.max(0, (verseNumber / surah.total_verses) * 100));

  return (
    <Pressable
      onPress={() => navigate(route)}
      accessibilityRole="button"
      className="active:opacity-90"
      style={{
        overflow: "hidden",
        backgroundColor: palette.heroBg,
        borderRadius: 36,
        padding: 22,
        marginBottom: 22,
      }}
    >
      <View
        style={{
          position: "absolute",
          left: -40,
          bottom: -60,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: palette.heroBlob,
        }}
      />
      <AppText size={12.5} color={palette.heroInk2} style={{ marginBottom: 8 }}>
        {t("continueReading")}
      </AppText>
      <AppText
        variant="quran"
        size={30}
        lineHeight={1.7}
        color={palette.heroInk}
        style={{ marginBottom: 2 }}
      >
        {`${SURAH_PREFIX} ${surah.name_arabic}`}
      </AppText>
      <AppText size={14} color={palette.heroInk} style={{ marginBottom: 16 }}>
        {`${t("ayahOfTotal", { verse: verseNumber, total: surah.total_verses })} · ${t("juzNumber", { number: juzNumber })}`}
      </AppText>
      <View
        style={{
          height: 9,
          borderRadius: 999,
          backgroundColor: palette.heroTrack,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: palette.sage,
          }}
        />
      </View>
      <PillButton label={t("continueReadingAction")} icon="arrowForward" iconPosition="end" />
    </Pressable>
  );
}
