import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";

import { useDirection } from "@/hooks/use-direction";
import { useIconColors } from "@/hooks/use-icon-colors";

interface BackButtonProps {
  onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  const { foreground } = useIconColors();
  const { chevronBack } = useDirection();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      className="w-9 h-9 items-center justify-center rounded-full bg-muted"
    >
      <Ionicons name={chevronBack} size={22} color={foreground} />
    </Pressable>
  );
}
