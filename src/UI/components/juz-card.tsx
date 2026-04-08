import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";

import { Badge } from "@/components/ui/badge";
import type { Juz } from "../api/types";

interface JuzCardProps {
  juz: Juz;
  onPress: (juz: Juz) => void;
}

/** One row in the juz (para) list. */
export default function JuzCard({ juz, onPress }: JuzCardProps) {
  const { muted } = useIconColors();

  return (
    <Pressable
      onPress={() => onPress(juz)}
      className="mx-4 mb-3 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 active:opacity-70"
    >
      {/* Number badge */}
      <Badge variant={'secondary'}>
        {juz.number}
      </Badge>

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

      <Ionicons
        name="chevron-forward"
        size={18}
        color={muted}
        style={{ marginLeft: 4 }}
      />
    </Pressable>
  );
}
