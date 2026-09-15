import { useCallback, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import View from "@/components/ui/view";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { navigate, ROUTES } from "@/lib/routes";
import ScreenHeader from "@/UI/screen-header";
import SearchInput from "@/UI/search-input";

import JuzCard from "./juz-card";
import type { Juz } from "./juz-config";
import { filterJuz } from "./juz-filter";
import { useGetAllJuz } from "./juz-hooks";

export default function JuzList() {
  const { t } = useSharedUiLang();
  const { juzList } = useGetAllJuz();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterJuz(juzList, query), [juzList, query]);
  const openJuz = useCallback((juz: Juz) => navigate(ROUTES.juz(juz.number)), []);

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScreenHeader title={t("juzListTitle")} subtitle={t("juzListSubtitle")} />
        <FlatList
          data={filtered}
          keyExtractor={(j) => String(j.number)}
          renderItem={({ item }) => <JuzCard juz={item} onPress={openJuz} />}
          ListHeaderComponent={
            <View className="bg-background pt-3 px-2">
              <SearchInput value={query} onChange={setQuery} placeholder={t("search")} />
            </View>
          }
          contentContainerStyle={{ padding: 10, gap: 8 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={30}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </View>
  );
}
