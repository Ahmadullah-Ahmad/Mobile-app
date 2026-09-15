import { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import { useTranslationLang } from "@/hooks/use-translation-lang";
import { QURAN_TITLE, TRANSLATION_OPTIONS } from "@/lib/constants";
import { navigate, ROUTES } from "@/lib/routes";
import AppText from "@/UI/app-text";
import SectionHeader from "@/UI/section-header";
import SegmentedPills from "@/UI/segmented-pills";

import type { Surah } from "../surahs/surahs-config";
import { useGetAllSurahs } from "../surahs/surahs-hooks";
import SurahsRow from "../surahs/surahs-row";
import { HOME_SURAH_COUNT } from "./home-config";
import HomeContinueCard from "./home-continue-card";
import { useContinueReading } from "./home-hooks";
import HomeJuzStrip from "./home-juz-strip";

export default function HomeView() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { lang, setLang } = useTranslationLang();
  const { surahs } = useGetAllSurahs();
  const reading = useContinueReading();

  const openSurah = useCallback((surah: Surah) => navigate(ROUTES.surah(surah.number)), []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 4, paddingHorizontal: 22, paddingBottom: 22 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ direction: writingDirection }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <SegmentedPills
            options={TRANSLATION_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
            value={lang}
            onChange={setLang}
          />
          <AppText variant="quran" size={23} lineHeight={2}>
            {QURAN_TITLE}
          </AppText>
        </View>

        <HomeContinueCard reading={reading} />

        <SectionHeader
          title={t("juzListTitle")}
          actionLabel={t("juzListSubtitle")}
          onAction={() => navigate(ROUTES.juzList)}
        />
        <HomeJuzStrip currentJuz={reading.juzNumber} />

        <SectionHeader
          title={t("surahsTitle")}
          actionLabel={t("allSurahs")}
          onAction={() => navigate(ROUTES.surahs)}
        />
        <View style={{ gap: 9 }}>
          {surahs.slice(0, HOME_SURAH_COUNT).map((surah) => (
            <SurahsRow key={surah.id} surah={surah} variant="compact" onPress={openSurah} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
