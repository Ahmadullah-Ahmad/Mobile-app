import type { RevelationType, Verse } from "@/lib/common-types";
import { BISMILLAH_TEXT } from "@/lib/constants";

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

export const BISMILLAH_FALLBACK: Verse = {
  id: 0,
  surah_id: 0,
  verse_number: 0,
  arabic: BISMILLAH_TEXT,
  pashto: "د اللهﷻ په نوم چې رحمت یې بې حده او رحم یې تلپاتې دی",
  dari: "به نام خداوند بخشنده مهربان",
  juz_number: null,
};
