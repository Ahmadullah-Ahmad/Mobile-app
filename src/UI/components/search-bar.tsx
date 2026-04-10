import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { Input } from "@/components/ui/input";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
import { useDirection } from "@/lib/i18n-provider";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "لټون...",
}: SearchBarProps) {
  const { muted } = useIconColors();
  const { flexRow, writingDirection, textAlign, isRTL } = useDirection();

  return (
    <View style={{ flexDirection: flexRow }} className="mx-4 mb-3 relative items-center gap-2 h-12 px-3 rounded-xl bg-muted/60 border border-border">
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={muted}
        className="flex-1 h-12 border-0 bg-transparent shadow-none py-3 ios:shadow-none"
        style={{
          paddingHorizontal: 12,
          writingDirection,
          textAlign,
        }}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable
          hitSlop={8}
          onPress={() => onChange("")}
          style={{ position: "absolute", [isRTL ? "right" : "left"]: 24 }}
        >
          <Ionicons name="close-circle" size={18} color={muted} />
        </Pressable>
      ) : null}
    </View>
  );
}
