import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, Text, View } from "react-native";

import { useDirection } from "@/hooks/use-direction";
import { ACCENT_COLOR } from "@/lib/constants";

import type { Surah } from "../surahs/surahs-config";
import { useGetAllSurahs } from "../surahs/surahs-hooks";

export default function BookmarksForm({
  onSelect,
}: {
  onSelect: (surah: Surah) => void;
}) {
  const { surahs } = useGetAllSurahs();
  const { textAlign } = useDirection();
  const nameStyle = { writingDirection: "rtl", textAlign } as const;

  return (
    <View className="flex-1">
      <FlatList
        data={surahs}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            className="flex-row items-center px-5 py-3 border-b border-border active:bg-muted/50"
          >
            <View className="w-8 h-8 rounded-full bg-muted items-center justify-center mr-3">
              <Text className=" font-semibold text-foreground">{item.number}</Text>
            </View>
            <View className="flex-1">
              <Text style={nameStyle} className="text-foreground">
                {item.name_arabic}
              </Text>
              <Text style={nameStyle} className="text-foreground">
                {item.name_pashto}
              </Text>
            </View>
            <Ionicons name="bookmark-outline" size={20} color={ACCENT_COLOR} />
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}
