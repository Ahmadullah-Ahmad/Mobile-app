/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },
        "primary-foreground": "rgb(var(--color-primary-foreground) / <alpha-value>)",
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)",
        },
        background: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          foreground: "rgb(var(--color-background-foreground) / <alpha-value>)",
        },
        foreground: {
          DEFAULT: "rgb(var(--color-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-foreground-muted) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--color-destructive) / <alpha-value>)",
          foreground: "rgb(var(--color-destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          foreground: "rgb(var(--color-warning-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          foreground: "rgb(var(--color-info-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--color-card) / <alpha-value>)",
          foreground: "rgb(var(--color-card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--color-popover) / <alpha-value>)",
          foreground: "rgb(var(--color-popover-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-foreground) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          foreground: "rgb(var(--border-foreground) / <alpha-value>)",
        },
        input: {
          DEFAULT: "rgb(var(--input) / <alpha-value>)",
          foreground: "rgb(var(--input-foreground) / <alpha-value>)",
        },
        
        toggle: {
          active: "rgb(var(--toggle-active) / <alpha-value>)",
          "active-foreground": "rgb(var(--toggle-active-foreground) / <alpha-value>)",
          border: "rgb(var(--toggle-border) / <alpha-value>)",
        },
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        chart: {
          1: "rgb(var(--color-chart-1) / <alpha-value>)",
          2: "rgb(var(--color-chart-2) / <alpha-value>)",
          3: "rgb(var(--color-chart-3) / <alpha-value>)",
          4: "rgb(var(--color-chart-4) / <alpha-value>)",
          5: "rgb(var(--color-chart-5) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "rgb(var(--color-sidebar) / <alpha-value>)",
          foreground: "rgb(var(--color-sidebar-foreground) / <alpha-value>)",
          primary: "rgb(var(--color-sidebar-primary) / <alpha-value>)",
          "primary-foreground": "rgb(var(--color-sidebar-primary-foreground) / <alpha-value>)",
          accent: "rgb(var(--color-sidebar-accent) / <alpha-value>)",
          "accent-foreground": "rgb(var(--color-sidebar-accent-foreground) / <alpha-value>)",
          border: "rgb(var(--color-sidebar-border) / <alpha-value>)",
          ring: "rgb(var(--color-sidebar-ring) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [
    ({ addBase }) => {
      addBase({
        // Light theme — converted from the provided oklch palette to rgb triples
        // (NativeWind/RN doesn't render oklch yet, so we approximate).
        ":root": {
          "--color-background": "253 253 253",
          "--color-background-foreground": "38 38 38",
          "--color-foreground": "38 38 38",
          "--color-foreground-muted": "62 62 62",

          "--color-card": "253 253 253",
          "--color-card-foreground": "38 38 38",
          "--color-popover": "253 253 253",
          "--color-popover-foreground": "105 105 105",

          // Brand: mint green (oklch 0.83 0.13 160)
          "--color-primary": "110 222 165",
          "--color-primary-foreground": "50 60 55",

          "--color-secondary": "254 254 254",
          "--color-secondary-foreground": "38 38 38",

          "--color-muted": "238 238 238",
          "--color-muted-foreground": "62 62 62",

          "--color-accent": "238 238 238",
          "--color-accent-foreground": "62 62 62",

          "--color-destructive": "204 56 35",
          "--color-destructive-foreground": "252 244 242",

          // Status (kept from previous palette — not in the provided theme)
          "--color-success": "34 197 94",
          "--color-success-foreground": "255 255 255",
          "--color-warning": "234 179 8",
          "--color-warning-foreground": "255 255 255",
          "--color-info": "59 130 246",
          "--color-info-foreground": "255 255 255",

          "--border": "222 222 222",
          "--border-foreground": "38 38 38",
          "--input": "244 244 244",
          "--input-foreground": "38 38 38",

          "--color-ring": "110 222 165",

          // Charts
          "--color-chart-1": "110 222 165",
          "--color-chart-2": "92 140 240",
          "--color-chart-3": "150 110 240",
          "--color-chart-4": "224 168 60",
          "--color-chart-5": "100 200 145",

          // Sidebar
          "--color-sidebar": "253 253 253",
          "--color-sidebar-foreground": "130 130 130",
          "--color-sidebar-primary": "110 222 165",
          "--color-sidebar-primary-foreground": "50 60 55",
          "--color-sidebar-accent": "238 238 238",
          "--color-sidebar-accent-foreground": "62 62 62",
          "--color-sidebar-border": "222 222 222",
          "--color-sidebar-ring": "110 222 165",

          "--toggle-active": "110 222 165",
          "--toggle-active-foreground": "50 60 55",
          "--toggle-border": "222 222 222",
        },

        // Dark theme
        ".dark:root, :root.dark": {
          "--color-background": "33 33 33",
          "--color-background-foreground": "230 232 238",
          "--color-foreground": "230 232 238",
          "--color-foreground-muted": "161 161 161",

          "--color-card": "38 38 38",
          "--color-card-foreground": "230 232 238",
          "--color-popover": "50 50 50",
          "--color-popover-foreground": "168 168 168",

          // Darker mint green (oklch 0.44 0.10 157)
          "--color-primary": "40 100 70",
          "--color-primary-foreground": "220 232 225",

          "--color-secondary": "50 50 50",
          "--color-secondary-foreground": "250 250 250",

          "--color-muted": "46 46 46",
          "--color-muted-foreground": "161 161 161",

          "--color-accent": "64 64 64",
          "--color-accent-foreground": "250 250 250",

          "--color-destructive": "95 35 25",
          "--color-destructive-foreground": "240 232 230",

          "--color-success": "34 197 94",
          "--color-success-foreground": "255 255 255",
          "--color-warning": "234 179 8",
          "--color-warning-foreground": "0 0 0",
          "--color-info": "59 130 246",
          "--color-info-foreground": "255 255 255",

          "--border": "56 56 56",
          "--border-foreground": "230 232 238",
          "--input": "50 50 50",
          "--input-foreground": "230 232 238",

          "--color-ring": "100 200 145",

          "--color-chart-1": "100 200 145",
          "--color-chart-2": "115 175 235",
          "--color-chart-3": "160 130 235",
          "--color-chart-4": "215 175 80",
          "--color-chart-5": "130 210 195",

          "--color-sidebar": "33 33 33",
          "--color-sidebar-foreground": "150 150 150",
          "--color-sidebar-primary": "40 100 70",
          "--color-sidebar-primary-foreground": "220 232 225",
          "--color-sidebar-accent": "64 64 64",
          "--color-sidebar-accent-foreground": "250 250 250",
          "--color-sidebar-border": "56 56 56",
          "--color-sidebar-ring": "100 200 145",

          "--toggle-active": "100 200 145",
          "--toggle-active-foreground": "30 30 30",
          "--toggle-border": "56 56 56",
        },
      });
    },
  ],
};
