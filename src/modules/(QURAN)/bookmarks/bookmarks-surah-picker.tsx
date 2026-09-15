import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";
import { useDrawerBottomSpace } from "@/UI/drawer-panel";
import SearchInput from "@/UI/search-input";

import type { Surah } from "../surahs/surahs-config";
import { filterSurahs } from "../surahs/surahs-filter";
import { useGetAllSurahs } from "../surahs/surahs-hooks";
import SurahsRow from "../surahs/surahs-row";

export default function BookmarksSurahPicker({ onSelect }: { onSelect: (surah: Surah) => void }) {
  const palette = usePalette();
  const { t } = useSharedUiLang();
  const bottomSpace = useDrawerBottomSpace();
  const { surahs } = useGetAllSurahs();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterSurahs(surahs, query), [surahs, query]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
        <SearchInput value={query} onChange={setQuery} placeholder={t("search")} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(surah) => String(surah.id)}
        renderItem={({ item }) => <SurahsRow surah={item} variant="compact" onPress={onSelect} />}
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: bottomSpace, gap: 9 }}
        ListEmptyComponent={
          <AppText size={14} color={palette.ink2} align="center" style={{ paddingVertical: 30 }}>
            {t("noSurahFound")}
          </AppText>
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
      />
    </View>
  );
}
