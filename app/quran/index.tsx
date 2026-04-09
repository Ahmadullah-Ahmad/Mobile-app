import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
import { useDirection, useUiLang } from "@/lib/i18n";
import {
  ScreenHeader,
  SearchBar,
  SurahCard,
  useLastRead,
  useSurahs,
  type Surah,
} from "@/UI";

// ─── Continue-reading pill ───────────────────────────────────────────────────
function ContinueReading({ lastSurahId }: { lastSurahId?: number }) {
  const { primary } = useIconColors();
  const { flexRow, chevronForward } = useDirection();
  const { t } = useUiLang();
  if (lastSurahId == null) return null;

  return (
    <View className="px-4 pt-3 pb-1 bg-background">
      <Pressable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPress={() => (router.push as any)(`/quran/${lastSurahId}`)}
        style={{ flexDirection: flexRow }}
        className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 items-center justify-between"
      >
        <Text className="text-primary font-medium text-sm">{t("continueReading")}</Text>
        <Ionicons name={chevronForward} size={20} color={primary} />
      </Pressable>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function SurahListScreen() {
  const { surahs, loading } = useSurahs();
  const { lastRead } = useLastRead();
  const [query, setQuery] = useState("");
  const { t } = useUiLang();

  const filtered = query.trim()
    ? surahs.filter(
      (s) =>
        s.name_arabic.includes(query) ||
        s.name_pashto.includes(query) ||
        s.name_transliteration.toLowerCase().includes(query.toLowerCase()) ||
        String(s.number).includes(query)
    )
    : surahs;

  const openSurah = (s: Surah) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (router.push as any)(`/quran/${s.number}`);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-3 text-sm">{t("loading")}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScreenHeader title={t("surahListTitle")} subtitle={t("surahListSubtitle")} />
        <FlatList
          data={filtered}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => <SurahCard surah={item} onPress={openSurah} />}
          ListHeaderComponent={
            <View className="bg-background pt-3">
              <ContinueReading lastSurahId={lastRead?.surah_id} />
              <SearchBar value={query} onChange={setQuery} placeholder={t("search")} />
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
