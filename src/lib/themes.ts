import { vars } from "nativewind";

import themeTokens from "./theme-tokens.json";

export const themes = {
  light: vars(themeTokens.light),
  dark: vars(themeTokens.dark),
} as const;
