/**
 * Theme module — public barrel.
 *
 * Provides the React context (`ThemeProvider`, `useTheme`), the NativeWind
 * CSS-variable theme objects (`themes`), and the legacy color/font tokens
 * (`Colors`, `Fonts`) used by `useThemeColor`.
 */

export { ThemeProvider, useTheme } from "./theme-context";
export { themes } from "./themes";
export { Colors, Fonts } from "./colors";
