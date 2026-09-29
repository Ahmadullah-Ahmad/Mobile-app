import type { TranslationKey } from "@/i18n/messages";

export interface Dhikr {
  id: string;
  arabic: string;
  meaningKey: TranslationKey;
}

export const DHIKR_LIST: Dhikr[] = [
  { id: "subhanallah", arabic: "سُبْحَانَ اللَّهِ", meaningKey: "dhikrSubhanallah" },
  { id: "alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", meaningKey: "dhikrAlhamdulillah" },
  { id: "allahuakbar", arabic: "اللَّهُ أَكْبَرُ", meaningKey: "dhikrAllahuAkbar" },
  { id: "tahlil", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", meaningKey: "dhikrTahlil" },
  { id: "istighfar", arabic: "أَسْتَغْفِرُ اللَّهَ", meaningKey: "dhikrIstighfar" },
  { id: "salawat", arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", meaningKey: "dhikrSalawat" },
];

// 0 means no target: count without rounds.
export const TARGETS = [33, 99, 100, 0] as const;
export type Target = (typeof TARGETS)[number];

export interface TasbihState {
  dhikrId: string;
  target: Target;
  counts: Record<string, number>;
}

export const DEFAULT_TASBIH: TasbihState = { dhikrId: DHIKR_LIST[0].id, target: 33, counts: {} };

export function isTasbihState(value: unknown): value is TasbihState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.dhikrId === "string" &&
    TARGETS.includes(v.target as Target) &&
    !!v.counts &&
    typeof v.counts === "object"
  );
}

export function roundProgress(count: number, target: Target) {
  if (target === 0) return { inRound: count, round: 1, fraction: 0 };
  const inRound = count === 0 ? 0 : ((count - 1) % target) + 1;
  return { inRound, round: Math.max(1, Math.ceil(count / target)), fraction: inRound / target };
}
