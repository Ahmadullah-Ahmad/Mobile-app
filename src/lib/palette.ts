// Brand colours from the app icon: deep green background and gold lettering.
export const BRAND: { green: string; gold: string; ivory: string } = {
  green: "#0a3c23",
  gold: "#d4af37",
  ivory: "#f6f3e9",
};

const light = {
  ground: BRAND.ivory,
  panel: "#e7e9dd",
  ink: "#13241a",
  ink2: "rgba(19, 36, 26, 0.62)",
  edge: "rgba(19, 36, 26, 0.1)",

  accent: BRAND.green,
  onAccent: BRAND.ivory,
  accentSoft: "#d9e7dd",
  accentBorder: "#7fa58c",
  accentText: BRAND.green,
  accentStrong: BRAND.green,

  gold: "#b8922a",
  goldText: "#9c7a1c",

  secondary: BRAND.gold,
  secondarySoft: "#f2e8c4",
  secondaryStrong: "#6f5510",

  heroBg: "#e2ece3",
  heroInk: BRAND.green,
  heroInk2: "#2f5a40",
  heroTrack: "rgba(10, 60, 35, 0.14)",
  heroBlob: "rgba(10, 60, 35, 0.08)",

  prayerBg: BRAND.green,
  prayerInk: BRAND.ivory,
  prayerInk2: "rgba(246, 243, 233, 0.72)",
  prayerAccent: BRAND.gold,
  prayerChip: "rgba(246, 243, 233, 0.14)",

  chipOff: "rgba(19, 36, 26, 0.65)",
  tabOff: "rgba(19, 36, 26, 0.45)",
  juzBadge: BRAND.ivory,
  bookmarkOffBg: "#e1e4d7",
  bookmarkOffInk: "#6b7a6f",
  optionBorder: "rgba(19, 36, 26, 0.14)",
  themeOffBg: "#e7e9dd",
  themeOffInk: "#13241a",

  backdrop: "rgba(6, 24, 14, 0.45)",
  shadow: "#06180e",
};

export type Palette = typeof light;

const dark: Palette = {
  ground: BRAND.green,
  panel: "rgba(246, 243, 233, 0.08)",
  ink: BRAND.ivory,
  ink2: "rgba(246, 243, 233, 0.72)",
  edge: "rgba(246, 243, 233, 0.16)",

  accent: BRAND.gold,
  onAccent: BRAND.green,
  accentSoft: "rgba(212, 175, 55, 0.22)",
  accentBorder: BRAND.gold,
  accentText: "#e6c65c",
  accentStrong: "#e6c65c",

  gold: BRAND.gold,
  goldText: "#e0bf52",

  secondary: BRAND.gold,
  secondarySoft: "rgba(246, 243, 233, 0.14)",
  secondaryStrong: BRAND.ivory,

  heroBg: "rgba(246, 243, 233, 0.08)",
  heroInk: BRAND.ivory,
  heroInk2: "#e0bf52",
  heroTrack: "rgba(246, 243, 233, 0.16)",
  heroBlob: "rgba(212, 175, 55, 0.12)",

  prayerBg: "rgba(212, 175, 55, 0.14)",
  prayerInk: BRAND.ivory,
  prayerInk2: "rgba(246, 243, 233, 0.72)",
  prayerAccent: "#e6c65c",
  prayerChip: "rgba(246, 243, 233, 0.12)",

  chipOff: "rgba(246, 243, 233, 0.72)",
  tabOff: "rgba(246, 243, 233, 0.55)",
  juzBadge: "rgba(246, 243, 233, 0.14)",
  bookmarkOffBg: "rgba(246, 243, 233, 0.12)",
  bookmarkOffInk: "#e5e2d6",
  optionBorder: "rgba(246, 243, 233, 0.22)",
  themeOffBg: "rgba(246, 243, 233, 0.1)",
  themeOffInk: BRAND.ivory,

  backdrop: "rgba(3, 16, 9, 0.55)",
  shadow: "#020a06",
};

export const PALETTE = { light, dark };
