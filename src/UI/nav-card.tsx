import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useDirection } from "@/hooks/use-direction";
import { cn } from "@/lib/utils";

interface NavCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  highlighted?: boolean;
}

export default function NavCard({
  title,
  subtitle,
  icon,
  onPress,
  highlighted = false,
}: NavCardProps) {
  const { chevronForward, isRTL, writingDirection } = useDirection();
  const chevron = <Ionicons name={chevronForward} size={20} color="gray" />;

  return (
    <Pressable
      onPress={onPress}
      className="w-full bg-card border border-border rounded-2xl py-4 px-5 flex-row items-center justify-between active:opacity-80"
    >
      {isRTL && chevron}
      <View className="flex-row items-center gap-3">
        <View
          className={cn(
            "w-10 h-10 rounded-full items-center justify-center",
            highlighted ? "bg-card-foreground/20" : "bg-muted"
          )}
        >
          <Ionicons name={icon} size={20} color={highlighted ? "white" : "gray"} />
        </View>
        <View>
          <Text
            style={{ writingDirection }}
            className="text-foreground text-lg font-semibold"
          >
            {title}
          </Text>
          <Text
            className={cn(
              "text-xs",
              highlighted ? "text-foreground/70" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      {!isRTL && chevron}
    </Pressable>
  );
}
