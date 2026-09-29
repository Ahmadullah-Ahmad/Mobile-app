import type { TranslationKey } from "@/i18n/messages";
import { ROUTES } from "@/lib/routes";
import type { IconName } from "@/UI/icon";

export const HOME_TOOLS: { route: string; icon: IconName; labelKey: TranslationKey }[] = [
  { route: ROUTES.prayer, icon: "clock", labelKey: "prayerTimes" },
  { route: ROUTES.qibla, icon: "compass", labelKey: "qibla" },
  { route: ROUTES.tasbih, icon: "beads", labelKey: "tasbih" },
  { route: ROUTES.zakat, icon: "coins", labelKey: "zakat" },
];

export interface ContinueReading {
  surah: { id: number; number: number; name_arabic: string; total_verses: number } | null;
  verseNumber: number;
  juzNumber: number;
  route: string;
}
