import { Animated, View } from "react-native";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";

import { usePalette } from "@/hooks/use-palette";
import { FONTS } from "@/lib/fonts";

import { DIAL_SIZE } from "./qibla-config";

const C = DIAL_SIZE / 2;
const R = C - 8;
const CARDINALS = [
  { label: "N", angle: 0 },
  { label: "E", angle: 90 },
  { label: "S", angle: 180 },
  { label: "W", angle: 270 },
];

interface QiblaDialProps {
  qibla: number;
  rotation: Animated.Value;
  aligned: boolean;
}

export default function QiblaDial({ qibla, rotation, aligned }: QiblaDialProps) {
  const palette = usePalette();
  const markerColor = aligned ? palette.gold : palette.accent;
  const rotate = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
    extrapolate: "extend",
  });

  return (
    <View style={{ width: DIAL_SIZE, height: DIAL_SIZE, alignSelf: "center" }}>
      <Animated.View style={{ position: "absolute", inset: 0, transform: [{ rotate }] }}>
        <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
          <Circle cx={C} cy={C} r={R} fill={palette.panel} stroke={palette.edge} strokeWidth={2} />
          {Array.from({ length: 72 }, (_, i) => {
            const major = i % 6 === 0;
            return (
              <Line
                key={i}
                x1={C}
                y1={C - R + 6}
                x2={C}
                y2={C - R + (major ? 18 : 11)}
                stroke={major ? palette.ink : palette.ink2}
                strokeWidth={major ? 2.4 : 1.2}
                strokeLinecap="round"
                transform={`rotate(${i * 5} ${C} ${C})`}
              />
            );
          })}
          {CARDINALS.map(({ label, angle }) => (
            <G key={label} transform={`rotate(${angle} ${C} ${C})`}>
              <SvgText
                x={C}
                y={C - R + 40}
                fontSize={17}
                fontFamily={FONTS.latin}
                textAnchor="middle"
                fill={label === "N" ? palette.accentText : palette.ink2}
              >
                {label}
              </SvgText>
            </G>
          ))}
          <G transform={`rotate(${qibla} ${C} ${C})`}>
            <Line x1={C} y1={C} x2={C} y2={C - R + 62} stroke={markerColor} strokeWidth={3} strokeDasharray="4 6" strokeLinecap="round" />
            <Rect x={C - 15} y={C - R + 30} width={30} height={30} rx={4} fill={palette.ink} />
            <Rect x={C - 15} y={C - R + 37} width={30} height={5} fill={palette.gold} />
          </G>
        </Svg>
      </Animated.View>

      <Svg width={DIAL_SIZE} height={DIAL_SIZE} style={{ position: "absolute" }} pointerEvents="none">
        <Path
          d={`M${C} ${C - 58} L${C + 13} ${C + 6} L${C} ${C - 4} L${C - 13} ${C + 6} Z`}
          fill={markerColor}
        />
        <Circle cx={C} cy={C} r={7} fill={palette.ground} stroke={markerColor} strokeWidth={3} />
      </Svg>
    </View>
  );
}
