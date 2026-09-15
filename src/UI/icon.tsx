import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

import { useSharedUiLang } from "@/context/ui-lang-context";

interface IconShape {
  paths: string[];
  circles?: { cx: number; cy: number; r: number }[];
  directional?: boolean;
}

const SUN_RAYS =
  "M12 2.5v2.5M12 19v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2L18 18M18 6l-1.8 1.8M7.8 16.2L6 18";

const ICONS = {
  book: { paths: ["M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"] },
  list: { paths: ["M4 6h16M4 12h16M4 18h9"] },
  juz: { paths: ["M12 3.5v17"], circles: [{ cx: 12, cy: 12, r: 8.5 }] },
  bookmark: { paths: ["M6 3h12v18l-6-4-6 4z"] },
  sun: { paths: [SUN_RAYS], circles: [{ cx: 12, cy: 12, r: 3.4 }] },
  moon: { paths: ["M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"] },
  search: { paths: ["M20 20l-4.3-4.3"], circles: [{ cx: 11, cy: 11, r: 7 }] },
  chevronForward: { paths: ["M15 6l-6 6 6 6"], directional: true },
  chevronBack: { paths: ["M9 6l6 6-6 6"], directional: true },
  arrowForward: { paths: ["M19 12H5M11 6l-6 6 6 6"], directional: true },
  close: { paths: ["M6 6l12 12M18 6L6 18"] },
  plus: { paths: ["M12 5v14M5 12h14"] },
  minus: { paths: ["M5 12h14"] },
  trash: { paths: ["M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"] },
  check: { paths: ["M20 6L9 17l-5-5"] },
} satisfies Record<string, IconShape>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size: number;
  color: string;
  fill?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Icon({
  name,
  size,
  color,
  fill = "none",
  strokeWidth = 2.75,
  style,
}: IconProps) {
  const { isRTL } = useSharedUiLang();
  const shape: IconShape = ICONS[name];
  const mirrored = shape.directional && !isRTL;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={[mirrored ? { transform: [{ scaleX: -1 }] } : null, style]}
    >
      <G
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {shape.circles?.map((circle, i) => <Circle key={i} {...circle} />)}
        {shape.paths.map((d, i) => (
          <Path key={i} d={d} />
        ))}
      </G>
    </Svg>
  );
}
