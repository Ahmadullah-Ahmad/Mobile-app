import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
import { useJuzList } from "@/hooks/use-quran";
import { Juz } from "@/lib/quran-db";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Juz card ─────────────────────────────────────────────────────────────────
function JuzCard({ juz }: { juz: Juz }) {
  const { muted } = useIconColors();

  return (
    <Pressable
      onPress={() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (router.push as any)(`/quran/juz/${juz.number}`)
      }
      className="mx-4 mb-3 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 active:opacity-70"
    >
      {/* Number badge */}
      <View className="w-11 h-11 rounded-full items-center justify-center mr-3 flex-shrink-0 bg-primary">
        <Text className="text-sm font-bold text-primary-foreground">
          {juz.number}
        </Text>
      </View>

      {/* Juz name + range */}
      <View className="flex-1 items-end bg-transparent">
        <Text
          style={{ writingDirection: "rtl", textAlign: "right" }}
          className="text-lg font-semibold text-foreground"
        >
          {juz.name_arabic}
        </Text>
        <Text
          style={{ writingDirection: "rtl", textAlign: "right" }}
          className="text-sm text-muted-foreground mt-0.5"
        >
          {juz.start_surah_name} ({juz.start_surah}:{juz.start_verse})
        </Text>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={18} color={muted} style={{ marginLeft: 4 }} />
    </Pressable>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header() {
  return (
    <View className="px-4 pb-4 pt-2 bg-background">
      <Text
        style={{ writingDirection: "rtl", textAlign: "center" }}
        className="text-3xl font-bold text-foreground mb-1"
      >
        پاره
      </Text>
      <Text className="text-center text-muted-foreground text-sm mb-2">
        ۳۰ پاره
      </Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ParaListScreen() {
  const { juzList, loading } = useJuzList();

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
        <FlatList
          data={juzList}
          keyExtractor={(j) => String(j.number)}
          renderItem={({ item }) => <JuzCard juz={item} />}
          ListHeaderComponent={<Header />}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={30}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </View>
  );
}
