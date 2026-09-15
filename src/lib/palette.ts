const ACCENT = "#c67139";
const ACCENT_SOFT = "#ffe1d0";
const ACCENT_BORDER = "#f6a06b";
const ACCENT_TEXT = "#8c491a";
const ACCENT_STRONG = "#643312";
const SAGE = "#728157";
const SAGE_SOFT = "#e1eecc";
const SAGE_STRONG = "#3d472b";
const CREAM = "#f5ead8";

const shared = {
  accent: ACCENT,
  onAccent: CREAM,
  accentSoft: ACCENT_SOFT,
  accentBorder: ACCENT_BORDER,
  accentText: ACCENT_TEXT,
  accentStrong: ACCENT_STRONG,
  sage: SAGE,
  sageSoft: SAGE_SOFT,
  sageStrong: SAGE_STRONG,
  heroTrack: "rgba(39, 46, 27, 0.16)",
  heroBlob: "rgba(114, 129, 87, 0.22)",
  backdrop: "rgba(46, 43, 37, 0.45)",
  shadow: "#2e2b25",
};

export const PALETTE = {
  light: {
    ...shared,
    ground: CREAM,
    panel: "#ebddc5",
    ink: "#201e1d",
    ink2: "rgba(32, 30, 29, 0.6)",
    edge: "rgba(32, 30, 29, 0.1)",
    heroBg: "#f0fae1",
    heroInk: "#272e1b",
    heroInk2: SAGE_STRONG,
    chipOff: "rgba(32, 30, 29, 0.65)",
    tabOff: "rgba(32, 30, 29, 0.45)",
    juzBadge: CREAM,
    bookmarkOffBg: "#eee7db",
    bookmarkOffInk: "#82796a",
    optionBorder: "rgba(32, 30, 29, 0.14)",
    themeOffBg: "#ebddc5",
    themeOffInk: "#201e1d",
  },
  dark: {
    ...shared,
    ground: "#272e1b",
    panel: "rgba(249, 244, 237, 0.1)",
    ink: "#f9f4ed",
    ink2: "rgba(249, 244, 237, 0.72)",
    edge: "rgba(249, 244, 237, 0.18)",
    heroBg: "rgba(114, 129, 87, 0.3)",
    heroInk: "#f9f4ed",
    heroInk2: SAGE_SOFT,
    chipOff: "rgba(249, 244, 237, 0.72)",
    tabOff: "rgba(249, 244, 237, 0.55)",
    juzBadge: "rgba(249, 244, 237, 0.16)",
    bookmarkOffBg: "#474238",
    bookmarkOffInk: "#eee7db",
    optionBorder: "rgba(249, 244, 237, 0.22)",
    themeOffBg: "rgba(249, 244, 237, 0.1)",
    themeOffInk: "#f9f4ed",
  },
};

export type Palette = typeof PALETTE.light;
