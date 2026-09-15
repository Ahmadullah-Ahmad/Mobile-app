import type { RevelationType } from "@/lib/common-types";

export interface Surah {
  id: number;
  number: number;
  name_arabic: string;
  name_pashto: string;
  name_dari: string;
  name_transliteration: string;
  total_verses: number;
  revelation_type: RevelationType;
  has_content: boolean;
}

export const SURAH_ROW_VARIANTS = {
  compact: { radius: 26, paddingVertical: 12, paddingHorizontal: 15, badge: 34, badgeFont: 15, name: 19 },
  full: { radius: 28, paddingVertical: 13, paddingHorizontal: 16, badge: 38, badgeFont: 16, name: 20 },
} as const;
