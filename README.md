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

The layout follows the same module pattern as the small-store web app. Route
files are thin wrappers, features live in `src/modules/(GROUP)/<feature>/`, and
anything used by more than one feature lives in a shared folder.

```
app/                               # Routes only (expo-router); each file renders one module view
  _layout.tsx                      # Fonts, DB version check, AppProviders, Stack
  (GENERAL)/index.tsx              # /            -> home-view
  (SETTINGS)/settings.tsx          # /settings    -> settings-view
  (QURAN)/quran/
    _layout.tsx                    # Quran stack animation
    index.tsx                      # /quran       -> surahs-list
    [id].tsx                       # /quran/:id   -> surahs-reader
    para.tsx                       # /quran/para  -> juz-list
    juz/[number].tsx               # /quran/juz/:number -> juz-reader
    bookmarks.tsx                  # /quran/bookmarks   -> bookmarks-view

src/
  modules/                         # One folder per feature, files prefixed with the feature name
    (GENERAL)/home/                # home-view, home-config
    (SETTINGS)/settings/           # settings-view, -section, -language-select, -theme-toggle, -font-size, -config
    (QURAN)/surahs/                # surahs-list, -reader, -book-page, -card, -continue-reading, -hooks, -filter, -config
    (QURAN)/juz/                   # juz-list, -reader, -book-page, -card, -surah-divider, -hooks, -filter, -config
    (QURAN)/bookmarks/             # bookmarks-view, -row, -form, -hooks, -config
    (QURAN)/search/                # search-hooks
  UI/                              # App-level reusable components
                                   #   book-pager, book-page-frame, verse-item, bismillah-banner,
                                   #   screen-header, back-button, search-input, nav-card,
                                   #   confirm-dialog, loading-spinner, empty-data-component, …
  components/ui/                   # Primitives (Text, View, Dropdown, Drawer, …)
  hooks/                           # Shared hooks
                                   #   use-sync-query, use-mutation, use-persisted-setting,
                                   #   use-last-read, use-translation-lang, use-font-size, use-direction
  context/                         # app-providers, database-provider, theme-context, ui-lang-context
  db/                              # client (Drizzle), schema, seed, sync-read, db-version
  i18n/                            # config, messages, use-ui-lang, locales/{ps,fa,en}.json
  lib/                             # common-types, constants, routes, settings, themes, utils

assets/
  db/app.db                        # Pre-seeded SQLite database (Arabic + Pashto + Dari)
  fonts/                           # AmiriQuran.ttf, Amiri-Regular.ttf

scripts/                           # Python utilities for DB management
drizzle.config.ts                  # Drizzle Kit config (schema, dialect, driver)
```

### Adding a feature

1. Create `src/modules/(GROUP)/<feature>/` with `<feature>-config.ts` for types and constants,
   `<feature>-hooks.ts` for data access, and `<feature>-view.tsx` for the screen.
2. Read data with `useSyncQuery` when the screen needs it on first paint, and write with `useMutation`.
3. Add a route file under `app/(GROUP)/` that only renders the view, and add its path to `src/lib/routes.ts`.
4. Put a component in `src/UI/` only once a second feature needs it.

## Database

The app ships a pre-seeded `assets/db/app.db` SQLite file. On first launch, Expo copies it to the device's document directory.

**Schema tables:** `surahs`, `verses`, `bookmarks`, `last_read`, `juz`

On startup, the app automatically:
1. Runs **Drizzle migrations** (`drizzle/`) — creates/updates the schema
2. Runs **seed** (`src/db/seed.ts`) — inserts the 114 surahs and 30 juz if not present

### Fixing a Corrupted Database

**On-device DB is corrupted** (e.g. "disk image is malformed"):

1. Bump `DB_VERSION` in `src/db/db-version.ts` (e.g. `"6"` → `"7"`).  
   On next launch the app wipes the corrupted SQLite directory, re-copies the asset DB, then runs migrations + seed automatically.
2. Run `pnpm start:clear`.

**Asset DB (`assets/db/app.db`) is corrupted or missing:**

```bash
# 1. Delete the corrupted file
rm assets/db/app.db

# 2. Rebuild schema from Python (creates empty DB with correct tables)
python3 scripts/init_db.py

# 3. Re-import verse content from .docx files
python3 scripts/import_dari.py
python3 scripts/parse_quran.py --docx "quran/surah_18.docx" --surah-number 18 --output assets/db/app.db --append

# 4. Bump DB_VERSION and restart
pnpm start:clear
```

> Surah metadata (114 surahs) and juz data (30 juz) are seeded automatically by the app on startup via `src/db/seed.ts` — you do not need to re-import those manually.

### Schema Changes

When you change `src/db/schema.ts`:

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
python3 scripts/parse_quran.py --docx "quran/surah_N.docx" --surah-number N --output assets/db/app.db --append
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
