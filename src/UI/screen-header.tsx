import type { ReactNode } from "react";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useDirection } from "@/hooks/use-direction";

import BackButton from "./back-button";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  hideBack?: boolean;
  onBack?: () => void;
}

export default function ScreenHeader({
  title,
  subtitle,
  right,
  hideBack = false,
  onBack,
}: ScreenHeaderProps) {
  const { flexRow, writingDirection } = useDirection();

  return (
    <View className="border-b border-border bg-background">
      <View
        style={{ flexDirection: flexRow }}
        className="items-center justify-between px-4 pt-3 pb-3"
      >
        {hideBack ? <View className="w-9 h-9" /> : <BackButton onPress={onBack} />}

        <View className="items-center flex-1 mx-2">
          <Text
            style={{ writingDirection, textAlign: "center" }}
            className="text-xl font-bold"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{ writingDirection, textAlign: "center" }}
              className="text-xs text-muted-foreground mt-0.5"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ?? <View className="w-9 h-9" />}
      </View>
    </View>
  );
}
