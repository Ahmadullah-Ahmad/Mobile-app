import { Pressable, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";

import { roundProgress, type Target } from "./tasbih-config";

const SIZE = 250;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TasbihCounterProps {
  count: number;
  target: Target;
  onPress: () => void;
}

export default function TasbihCounter({ count, target, onPress }: TasbihCounterProps) {
  const palette = usePalette();
  const { t, formatNumber } = useSharedUiLang();
  const { inRound, round, fraction } = roundProgress(count, target);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("tasbihTap")}
      accessibilityValue={{ now: inRound }}
      className="active:opacity-90"
      style={{ width: SIZE, height: SIZE, alignSelf: "center", alignItems: "center", justifyContent: "center" }}
    >
      <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill={palette.heroBg} stroke={palette.heroTrack} strokeWidth={STROKE} />
        {target !== 0 && fraction > 0 ? (
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={palette.secondary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * fraction} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        ) : null}
      </Svg>
      <View style={{ alignItems: "center" }}>
        <AppText variant="heading" size={64} lineHeight={1.2} color={palette.heroInk}>
          {formatNumber(inRound)}
        </AppText>
        {target !== 0 ? (
          <AppText size={13} color={palette.heroInk2}>
            {t("tasbihRound", { round })}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
