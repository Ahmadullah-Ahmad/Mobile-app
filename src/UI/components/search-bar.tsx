import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { Input } from "@/components/ui/input";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Right-to-left input direction (default true for Pashto/Dari/Arabic) */
  rtl?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "لټون...",
  rtl = true,
}: SearchBarProps) {
  const { muted } = useIconColors();

  return (
    <View className="mx-4 mb-3 relative flex-row items-center gap-2 h-12 px-3 rounded-xl bg-muted/60 border border-border">
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={muted}
        className="flex-1 h-12 border-0 bg-transparent shadow-none py-3 ios:shadow-none"
        style={{
          paddingHorizontal: 12,
          ...(rtl ? { writingDirection: "rtl", textAlign: "right" } : null),
        }}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable hitSlop={8} onPress={() => onChange("")} className="absolute left-6">
          <Ionicons name="close-circle" size={18} color={muted} />
        </Pressable>
      ) : null}
    </View>
  );
}
