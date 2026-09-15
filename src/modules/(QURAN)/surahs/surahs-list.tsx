import { useCallback, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import View from "@/components/ui/view";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useLastRead } from "@/hooks/use-last-read";
import { navigate, ROUTES } from "@/lib/routes";
import ScreenHeader from "@/UI/screen-header";
import SearchInput from "@/UI/search-input";

import SurahsCard from "./surahs-card";
import type { Surah } from "./surahs-config";
import SurahsContinueReading from "./surahs-continue-reading";
import { filterSurahs } from "./surahs-filter";
import { useGetAllSurahs } from "./surahs-hooks";

export default function SurahsList() {
  const { t } = useSharedUiLang();
  const { surahs } = useGetAllSurahs();
  const { lastRead } = useLastRead();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterSurahs(surahs, query), [surahs, query]);
  const openSurah = useCallback(
    (surah: Surah) => navigate(ROUTES.surah(surah.number)),
    []
  );

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScreenHeader
          title={t("surahListTitle")}
          subtitle={t("surahListSubtitle")}
        />
        <FlatList
          data={filtered}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => <SurahsCard surah={item} onPress={openSurah} />}
          ListHeaderComponent={
            <View className="bg-background pt-3">
              <SurahsContinueReading lastSurahId={lastRead?.surah_id} />
              <SearchInput value={query} onChange={setQuery} placeholder={t("search")} />
            </View>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={5}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </View>
  );
}
