import { View } from "react-native";

import { usePalette } from "@/hooks/use-palette";

import AppText from "./app-text";
import Icon, { type IconName } from "./icon";

interface EmptyDataComponentProps {
  icon: IconName;
  title: string;
}

export default function EmptyDataComponent({ icon, title }: EmptyDataComponentProps) {
  const palette = usePalette();

  return (
    <View style={{ alignItems: "center", paddingTop: 40, paddingHorizontal: 24, paddingBottom: 48 }}>
      <View
        style={{
          width: 78,
          height: 78,
          borderRadius: 39,
          backgroundColor: palette.panel,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon name={icon} size={32} color={palette.ink2} />
      </View>
      <AppText size={15} color={palette.ink2} align="center">
        {title}
      </AppText>
    </View>
  );
}
