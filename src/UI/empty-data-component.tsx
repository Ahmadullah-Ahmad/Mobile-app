import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useTheme } from "@/context/theme-context";

interface EmptyDataComponentProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}

export default function EmptyDataComponent({
  icon,
  title,
}: EmptyDataComponentProps) {
  const { theme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons
        name={icon}
        size={48}
        color={theme === "light" ? "black" : "gray"}
      />
      <Text className="text-muted-foreground text-base mt-4 text-center">
        {title}
      </Text>
    </View>
  );
}
