import { Input } from "@/components/ui/input";
import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
import { useLastRead, useSurahs } from "@/hooks/use-quran";
import { Surah } from "@/lib/quran-db";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Search bar ───────────────────────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="mx-4 mt-1 bg-background mb-3 relative rounded-md">
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="لټون..."
        placeholderTextColor="#9CA3AF"
        className="pr-10 bg-background rounded"
        style={{ writingDirection: "rtl", textAlign: "right" }}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
      <View className="absolute right-3 top-0 bottom-0 items-center justify-center">
        <Ionicons name="search" size={18} color="#9CA3AF" />
      </View>
    </View>
  );
}

// ─── Surah card ───────────────────────────────────────────────────────────────
function SurahCard({ surah }: { surah: Surah }) {
  const hasContent = Boolean(surah.has_content);
  const { muted } = useIconColors();

  return (
    <Pressable
      onPress={() =>
        hasContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (router.push as any)(`/quran/${surah.number}`)
          : undefined
      }
      className={cn(
        "mx-4 mb-3 flex-row items-center rounded-2xl border border-border px-4 py-3",
        hasContent ? "bg-card active:opacity-70" : "bg-muted/40 opacity-50"
      )}
    >
      {/* Number badge */}
      <View
        className={cn(
          "w-11 h-11 rounded-full items-center justify-center mr-3 flex-shrink-0",
          hasContent ? "bg-primary" : "bg-muted"
        )}
      >
        <Text
          className={cn(
            "text-sm font-bold",
            hasContent ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {surah.number}
        </Text>
      </View>

      {/* Names (LTR container, RTL text) */}
      <View className="flex-1 items-end bg-transparent">
        <Text
          style={{ writingDirection: "rtl", textAlign: "right" }}
          className="text-lg font-semibold text-foreground"
        >
          {surah.name_arabic}
        </Text>
        <Text
          style={{ writingDirection: "rtl", textAlign: "right" }}
          className="text-sm text-muted-foreground mt-0.5"
        >
          {surah.name_pashto}
        </Text>
      </View>

      {/* Meta (verses + revelation) */}
      <View className="items-end ml-3 flex-shrink-0 bg-transparent  rounded-sm p-2">
        <Text className="text-xs text-muted-foreground">
          {surah.total_verses} آیات
        </Text>
        <View
          className={cn(
            "mt-1 px-2 py-0.5 rounded-full",
            surah.revelation_type === "meccan"
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-blue-100 dark:bg-blue-900/30"
          )}
        >
          <Text
            className={cn(
              "text-xs font-medium",
              surah.revelation_type === "meccan"
                ? "text-amber-700 dark:text-amber-400"
                : "text-blue-700 dark:text-blue-400"
            )}
          >
            {surah.revelation_type === "meccan" ? "مکي" : "مدني"}
          </Text>
        </View>
      </View>

      {/* Arrow */}
      {hasContent && (
        <Ionicons name="chevron-forward" size={18} color={muted} style={{ marginLeft: 4 }} />
      )}
    </Pressable>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header({ lastSurahId }: { lastSurahId?: number }) {
  const { primary } = useIconColors();

  return (
    <View className="px-4 pb-4 pt-2 bg-background">
      {/* Title */}
      <Text
        style={{ writingDirection: "rtl", textAlign: "center" }}
        className="text-3xl font-bold text-foreground mb-1"
      >
        القرآن الكريم
      </Text>
      <Text className="text-center text-muted-foreground text-sm mb-4">
        پښتو او دری ژباړه
      </Text>

      {/* Continue reading banner */}
      {lastSurahId != null && (
        <Pressable
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress={() => (router.push as any)(`/quran/${lastSurahId}`)}
          className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 flex-row items-center justify-between"
        >
          <Text className="text-primary font-medium text-sm">
            ادامه لوستل
          </Text>
          <Ionicons name="chevron-forward" size={20} color={primary} />
        </Pressable>
      )}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function SurahListScreen() {
  const { surahs, loading } = useSurahs();
  const { lastRead } = useLastRead();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? surahs.filter(
      (s) =>
        s.name_arabic.includes(query) ||
        s.name_pashto.includes(query) ||
        s.name_transliteration
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        String(s.number).includes(query)
    )
    : surahs;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-3 text-sm">بارګیرول...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <FlatList
          data={filtered}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => <SurahCard surah={item} />}
          ListHeaderComponent={
            <>
              <Header lastSurahId={lastRead?.surah_id} />
              <SearchBar value={query} onChange={setQuery} />
            </>
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
