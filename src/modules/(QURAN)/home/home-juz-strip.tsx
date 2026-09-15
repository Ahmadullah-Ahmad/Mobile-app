import { Pressable, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import { navigate, ROUTES } from "@/lib/routes";
import NumberBadge from "@/UI/number-badge";

import { juzWindow } from "./home-config";

export default function HomeJuzStrip({ currentJuz }: { currentJuz: number }) {
  const palette = usePalette();
  const { t, formatNumber } = useSharedUiLang();
  const numbers = juzWindow(currentJuz);

  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 22 }}>
      {numbers.map((number, index) => {
        const active = number === currentJuz;
        const faded = !active && index === numbers.length - 1;
        return (
          <Pressable
            key={number}
            onPress={() => navigate(ROUTES.juz(number))}
            accessibilityRole="button"
            accessibilityLabel={t("juzNumber", { number })}
            style={{ opacity: faded ? 0.5 : 1 }}
          >
            <NumberBadge
              label={formatNumber(number)}
              size={58}
              fontSize={19}
              backgroundColor={active ? palette.accent : palette.panel}
              color={active ? palette.onAccent : palette.ink}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
