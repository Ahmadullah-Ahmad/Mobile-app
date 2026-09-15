import { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import { QURAN_TITLE } from "@/lib/constants";
import { navigate, ROUTES } from "@/lib/routes";
import AppText from "@/UI/app-text";
import ScreenHeading from "@/UI/screen-heading";
import ScreenTransition from "@/UI/screen-transition";
import SearchInput from "@/UI/search-input";
import TranslationTabs from "@/UI/translation-tabs";

import type { Surah } from "./surahs-config";
import { filterSurahs } from "./surahs-filter";
import { useGetAllSurahs } from "./surahs-hooks";
import SurahsRow from "./surahs-row";

export default function SurahsList() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { surahs } = useGetAllSurahs();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterSurahs(surahs, query), [surahs, query]);
  const openSurah = useCallback((surah: Surah) => navigate(ROUTES.surah(surah.number)), []);

  return (
    <ScreenTransition
      style={{
        flex: 1,
        backgroundColor: palette.ground,
        paddingTop: insets.top + 4,
        direction: writingDirection,
      }}
    >
      <View style={{ paddingHorizontal: 22, paddingBottom: 14 }}>
        <ScreenHeading
          title={QURAN_TITLE}
          subtitle={t("surahListSubtitle")}
          titleVariant="quran"
          titleLineHeight={1.9}
        />
        <TranslationTabs style={{ marginTop: 10 }} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("search")}
          style={{ marginTop: 10 }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(surah) => String(surah.id)}
        renderItem={({ item }) => <SurahsRow surah={item} onPress={openSurah} />}
        contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 22, paddingBottom: 16, gap: 9 }}
        ListEmptyComponent={
          <AppText
            size={14}
            color={palette.ink2}
            align="center"
            style={{ paddingVertical: 30, paddingHorizontal: 10 }}
          >
            {t("noSurahFound")}
          </AppText>
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        windowSize={7}
      />
    </ScreenTransition>
  );
}
