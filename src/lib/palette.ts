// Silver theme: polished cool silver surfaces with graphite/steel accents, verse text in pure black (white in dark mode).
export const SILVER: { base: string; light: string; graphite: string; mist: string } = {
  base: "#c3c9d1",
  light: "#dde2e8",
  graphite: "#2f3640",
  mist: "#f7f8fa",
};

const light = {
  ground: "#e8ebef",
  panel: "#f9fafb",
  ink: "#161a1f",
  ink2: "rgba(22, 26, 31, 0.6)",
  edge: "rgba(22, 26, 31, 0.08)",
  verseInk: "#000000",

  accent: SILVER.graphite,
  onAccent: "#ffffff",
  accentSoft: "#dce0e6",
  accentBorder: "#b6bdc7",
  accentText: "#38404b",
  accentStrong: "#262c34",

  gold: "#9aa3ae",
  goldText: "#68717d",

  secondary: SILVER.base,
  secondarySoft: "#eef0f3",
  secondaryStrong: "#2f3640",

  heroBg: "#f9fafb",
  heroInk: "#1d2229",
  heroInk2: "#5d6672",
  heroTrack: "rgba(29, 34, 41, 0.1)",
  heroBlob: "rgba(29, 34, 41, 0.045)",

  prayerBg: "#38404b",
  prayerInk: "#f5f7f9",
  prayerInk2: "rgba(245, 247, 249, 0.7)",
  prayerAccent: SILVER.light,
  prayerChip: "rgba(245, 247, 249, 0.12)",

  chipOff: "rgba(22, 26, 31, 0.62)",
  tabOff: "rgba(22, 26, 31, 0.42)",
  juzBadge: "#e8ebef",
  bookmarkOffBg: "#eceef2",
  bookmarkOffInk: "#7b838e",
  optionBorder: "rgba(22, 26, 31, 0.12)",
  themeOffBg: "#f9fafb",
  themeOffInk: "#161a1f",

  backdrop: "rgba(12, 14, 18, 0.42)",
  shadow: "#0c0e12",
};

export type Palette = typeof light;

const dark: Palette = {
  ground: "#1a1e23",
  panel: "#252a31",
  ink: "#eef1f4",
  ink2: "rgba(238, 241, 244, 0.66)",
  edge: "rgba(238, 241, 244, 0.09)",
  verseInk: "#ffffff",

  accent: SILVER.light,
  onAccent: "#1a1e23",
  accentSoft: "rgba(221, 226, 232, 0.14)",
  accentBorder: SILVER.base,
  accentText: SILVER.light,
  accentStrong: "#f1f3f6",

  gold: "#aab2bc",
  goldText: "#c2c8d0",

  secondary: SILVER.base,
  secondarySoft: "rgba(238, 241, 244, 0.1)",
  secondaryStrong: "#eef1f4",

  heroBg: "#252a31",
  heroInk: "#eef1f4",
  heroInk2: "#a9b1bb",
  heroTrack: "rgba(238, 241, 244, 0.12)",
  heroBlob: "rgba(195, 201, 209, 0.07)",

  prayerBg: "#353c46",
  prayerInk: "#f1f3f6",
  prayerInk2: "rgba(241, 243, 246, 0.7)",
  prayerAccent: SILVER.light,
  prayerChip: "rgba(241, 243, 246, 0.11)",

  chipOff: "rgba(238, 241, 244, 0.7)",
  tabOff: "rgba(238, 241, 244, 0.5)",
  juzBadge: "rgba(238, 241, 244, 0.1)",
  bookmarkOffBg: "rgba(238, 241, 244, 0.08)",
  bookmarkOffInk: "#c9ced5",
  optionBorder: "rgba(238, 241, 244, 0.16)",
  themeOffBg: "#252a31",
  themeOffInk: "#eef1f4",

  backdrop: "rgba(0, 0, 0, 0.62)",
  shadow: "#000000",
};

export const PALETTE = { light, dark };
