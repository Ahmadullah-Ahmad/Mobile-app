import { Pressable, View } from "react-native";

import { usePalette } from "@/hooks/use-palette";

import AppText from "./app-text";

interface SegmentedPillsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

const isLatin = (label: string) => /^[A-Za-z]/.test(label);

export default function SegmentedPills<T extends string>({
  options,
  value,
  onChange,
}: SegmentedPillsProps<T>) {
  const palette = usePalette();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: palette.panel,
        borderRadius: 999,
        padding: 3,
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              minHeight: 44,
              marginVertical: -4.5,
              minWidth: 52,
              paddingVertical: 6,
              paddingHorizontal: 13,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? palette.accent : "transparent",
            }}
          >
            <AppText
              variant={isLatin(option.label) ? "latin" : "naskh"}
              size={13.5}
              color={active ? palette.onAccent : palette.chipOff}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
