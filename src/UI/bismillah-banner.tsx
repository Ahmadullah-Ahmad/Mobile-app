import { View } from "react-native";

import { usePalette } from "@/hooks/use-palette";
import { BISMILLAH_TEXT } from "@/lib/constants";

import AppText from "./app-text";

export default function BismillahBanner({ size = 26 }: { size?: number }) {
  const palette = usePalette();

  return (
    <View style={{ alignItems: "center", paddingTop: 6, paddingBottom: 16 }}>
      <AppText
        variant="quran"
        size={size}
        lineHeight={2.1}
        color={palette.goldText}
        align="center"
      >
        {BISMILLAH_TEXT}
      </AppText>
    </View>
  );
}
