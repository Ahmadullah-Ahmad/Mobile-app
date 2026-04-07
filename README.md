# Quran App

A Quran reading app built with Expo (React Native) featuring Arabic text with Pashto and Dari translations, surah and juz navigation, bookmarks, and last-read position tracking.

## Stack

- **Expo SDK 54** / React Native 0.81.5
- **expo-router v6** — file-based navigation
- **NativeWind v4** — Tailwind CSS for React Native
- **expo-sqlite** — on-device SQLite database
- **Drizzle ORM** — type-safe query builder
- **AmiriQuran font** — traditional Arabic typography
- **TypeScript** strict mode

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + emulator or physical device with USB debugging

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd app

# 2. Install dependencies
pnpm install

# 3. Start the dev server (clears Metro cache)
pnpm start:clear
```

Then press:
- `i` to open iOS Simulator
- `a` to open Android emulator
- Scan the QR code with Expo Go on a physical device

## Project Structure

```
app/                    # Screens (expo-router file-based routing)
  _layout.tsx           # Root layout — fonts, theme, StatusBar
  index.tsx             # Home screen
  quran/
    _layout.tsx         # SQLiteProvider + DrizzleStudio wrapper
    index.tsx           # Surah list (114 surahs)
    para.tsx            # Juz/Para list (30 juz)
    [id].tsx            # Surah reader (paged, Arabic + translations)
    juz/
      [number].tsx      # Juz reader (paged, surah dividers)

components/
  quran/                # VerseCard, LanguageToggle
  ui/                   # Text, View, Dropdown, etc.

lib/
  db/
    index.ts            # useDb() Drizzle hook
    schema.ts           # Drizzle table definitions
  quran-db.ts           # All query helpers (getAllSurahs, getVerses, …)
  settings.ts           # Key-value persistence via AsyncStorage

hooks/
  use-quran.ts          # useSurahs, useVerses, useJuzVerses, useLastRead, …

assets/
  db/quran.db           # Pre-seeded SQLite database (Arabic + Pashto + Dari)
  fonts/                # AmiriQuran.ttf, Amiri-Regular.ttf

scripts/                # Python utilities for DB management
  parse_quran.py        # Parse .docx files → DB rows
  import_dari.py        # Batch import Dari translations
  import_juz.py         # Import Juz boundary data
  init_db.py            # Initialize fresh DB from scratch

drizzle.config.ts       # Drizzle Kit config (schema, dialect, driver)
```

## Database

The app ships a pre-seeded `assets/db/quran.db` SQLite file. On first launch, Expo copies it to the device's document directory.

**Schema tables:** `surahs`, `verses`, `bookmarks`, `last_read`, `juz`

On startup, the app automatically:
1. Runs **Drizzle migrations** (`drizzle/`) — creates/updates the schema
2. Runs **seed** (`lib/db/seed.ts`) — inserts the 114 surahs and 30 juz if not present

### Fixing a Corrupted Database

**On-device DB is corrupted** (e.g. "disk image is malformed"):

1. Bump `DB_VERSION` in `app/quran/_layout.tsx` (e.g. `"6"` → `"7"`).  
   On next launch the app wipes the corrupted SQLite directory, re-copies the asset DB, then runs migrations + seed automatically.
2. Run `pnpm start:clear`.

**Asset DB (`assets/db/quran.db`) is corrupted or missing:**

```bash
# 1. Delete the corrupted file
rm assets/db/quran.db

# 2. Rebuild schema from Python (creates empty DB with correct tables)
python3 scripts/init_db.py

# 3. Re-import verse content from .docx files
python3 scripts/import_dari.py
python3 scripts/parse_quran.py --docx "quran/surah_18.docx" --surah-number 18 --output assets/db/quran.db --append

# 4. Bump DB_VERSION and restart
pnpm start:clear
```

> Surah metadata (114 surahs) and juz data (30 juz) are seeded automatically by the app on startup via `lib/db/seed.ts` — you do not need to re-import those manually.

### Schema Changes

When you change `lib/db/schema.ts`:

```bash
# Generate a new migration SQL file into drizzle/
pnpm db:generate

# The migration runs automatically on next app launch
pnpm start:clear
```

## DB Inspection (Dev)

With the app running in dev mode, open Expo Dev Tools in your browser — a **Drizzle Studio** tab lets you browse and query the live on-device database.

## Adding Translations

Place `.docx` files in the `quran/` directory (gitignored — large files) and run:

```bash
python3 scripts/parse_quran.py --docx "quran/surah_N.docx" --surah-number N --output assets/db/quran.db --append
python3 scripts/import_dari.py  # batch import all Dari translations
```

## Key Config Files

| File | Purpose |
|------|---------|
| `babel.config.js` | NativeWind JSX transform + inline-import for `.sql` files |
| `metro.config.js` | NativeWind Metro plugin + `.sql` source extension |
| `tailwind.config.js` | NativeWind preset + custom CSS variable color palette |
| `drizzle.config.ts` | Drizzle Kit — schema path, dialect, driver |
| `tsconfig.json` | Strict TypeScript + `@/*` path alias |
