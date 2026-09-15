import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useDirection } from "@/hooks/use-direction";

interface SettingsSectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function SettingsSection({
  title,
  subtitle,
  children,
}: SettingsSectionProps) {
  const { textAlign } = useDirection();

  return (
    <View className="gap-2">
      <Text className="text-foreground text-base font-semibold" style={{ textAlign }}>
        {title}
      </Text>
      <Text className="text-muted-foreground text-xs mb-1" style={{ textAlign }}>
        {subtitle}
      </Text>
      {children}
    </View>
  );
}
