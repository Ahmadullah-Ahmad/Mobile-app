import { useTheme } from "@/context/theme-context";
import { PALETTE, type Palette } from "@/lib/palette";

export function usePalette(): Palette {
  const { theme } = useTheme();
  return PALETTE[theme];
}
