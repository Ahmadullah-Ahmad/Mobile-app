import { router } from "expo-router";
import { useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import View from "@/components/ui/view";
import { useSharedUiLang } from "@/lib/i18n-provider";
import {
  JuzCard,
  ScreenHeader,
  SearchBar,
  useJuzList,
  type Juz,
} from "@/UI";

export default function ParaListScreen() {
  const { juzList } = useJuzList();
  const [query, setQuery] = useState("");
  const { t } = useSharedUiLang();

  const filtered = query.trim()
    ? juzList.filter(
      (j) =>
        j.name_arabic.includes(query) ||
        String(j.number).includes(query)
    )
    : juzList;

  const openJuz = (j: Juz) =>
    router.push({ pathname: "/quran/juz/[number]", params: { number: String(j.number) } } as never);

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
              <SearchBar value={query} onChange={setQuery} placeholder={t("search")} />
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
