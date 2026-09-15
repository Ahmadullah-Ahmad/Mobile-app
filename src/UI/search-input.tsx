import { View, type StyleProp, type ViewStyle } from "react-native";

import { Input } from "@/components/ui/input";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import { FONTS } from "@/lib/fonts";

import Icon from "./icon";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  style,
}: SearchInputProps) {
  const palette = usePalette();
  const { isRTL } = useSharedUiLang();
  const { textAlign, writingDirection } = useDirection();

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: palette.panel,
          borderRadius: 999,
          paddingVertical: 10,
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      <Icon name="search" size={18} color={palette.ink2} />
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={palette.ink2}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        className="h-auto flex-1 border-0 bg-transparent px-0 shadow-none ios:shadow-none android:elevation-0"
        style={{
          minWidth: 0,
          paddingVertical: 0,
          fontSize: 15,
          color: palette.ink,
          fontFamily: isRTL ? FONTS.naskh : FONTS.latin,
          textAlign,
          writingDirection,
        }}
      />
    </View>
  );
}
