import type { ReactNode } from "react";
import { View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";

import AppText from "./app-text";
import IconButton from "./icon-button";

interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onClose: () => void;
}

export default function SheetHeader({ title, subtitle, action, onClose }: SheetHeaderProps) {
  const palette = usePalette();
  const { t } = useSharedUiLang();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 22,
        paddingTop: 4,
        paddingBottom: 14,
      }}
    >
      <View style={{ flex: 1 }}>
        <AppText size={21}>{title}</AppText>
        {subtitle ? (
          <AppText size={12} color={palette.ink2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action}
      <IconButton
        icon="close"
        onPress={onClose}
        accessibilityLabel={t("close")}
        backgroundColor={palette.panel}
      />
    </View>
  );
}
