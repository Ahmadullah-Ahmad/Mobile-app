import { toJalaali } from "jalaali-js";

import type { UiLang } from "@/i18n/config";

import { UMM_AL_QURA } from "./hijri-table";

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const HIJRI_MONTHS: Record<"local" | "english", string[]> = {
  local: [
    "محرم", "صفر", "ربیع الاول", "ربیع الثاني", "جمادی الاولی", "جمادی الثاني",
    "رجب", "شعبان", "رمضان", "شوال", "ذوالقعده", "ذوالحجه",
  ],
  english: [
    "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Ula", "Jumada al-Akhirah",
    "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah",
  ],
};

// Afghanistan names solar months after the zodiac, not the Iranian month names.
const SOLAR_MONTHS: Record<UiLang, string[]> = {
  pashto: ["وری", "غویی", "غبرگولی", "چنگاښ", "زمری", "وږی", "تله", "لړم", "لیندۍ", "مرغومی", "سلواغه", "کب"],
  dari: ["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"],
  english: ["Hamal", "Sawr", "Jawza", "Saratan", "Asad", "Sunbula", "Mizan", "Aqrab", "Qaws", "Jadi", "Dalw", "Hut"],
};

const WEEKDAYS: Record<UiLang, string[]> = {
  pashto: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"],
  dari: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"],
  english: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

const ERA: Record<"hijri" | "solar", Record<UiLang, string>> = {
  hijri: { pashto: "هـ.ق", dari: "هـ.ق", english: "AH" },
  solar: { pashto: "هـ.ش", dari: "هـ.ش", english: "SH" },
};

function julianDay(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    date.getDate() + Math.floor((153 * mm + 2) / 5) + 365 * yy +
    Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
  );
}

const TABULAR_EPOCH = 1948440;
const tabularToJdn = (y: number, m: number, d: number) =>
  d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + TABULAR_EPOCH - 1;

function tabularHijri(jdn: number): CalendarDate {
  const year = Math.floor((30 * (jdn - TABULAR_EPOCH) + 10646) / 10631);
  const month = Math.min(12, Math.ceil((jdn - (29 + tabularToJdn(year, 1, 1))) / 29.5) + 1);
  return { year, month, day: jdn - tabularToJdn(year, month, 1) + 1 };
}

export function toHijri(date: Date, adjustDays = 0): CalendarDate {
  const jdn = julianDay(date) + adjustDays;
  let start = UMM_AL_QURA.startJdn;
  if (jdn < start) return tabularHijri(jdn);

  for (let i = 0; i < UMM_AL_QURA.months.length; i++) {
    const length = UMM_AL_QURA.months[i] === "1" ? 30 : 29;
    if (jdn < start + length) {
      return {
        year: UMM_AL_QURA.startYear + Math.floor(i / 12),
        month: (i % 12) + 1,
        day: jdn - start + 1,
      };
    }
    start += length;
  }
  return tabularHijri(jdn);
}

export function toSolarHijri(date: Date): CalendarDate {
  const { jy, jm, jd } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { year: jy, month: jm, day: jd };
}

type FormatNumber = (n: number) => string;

export function formatHijriDate(date: Date, lang: UiLang, formatNumber: FormatNumber, adjustDays = 0): string {
  const { year, month, day } = toHijri(date, adjustDays);
  const months = HIJRI_MONTHS[lang === "english" ? "english" : "local"];
  return `${formatNumber(day)} ${months[month - 1]} ${formatNumber(year)} ${ERA.hijri[lang]}`;
}

export function formatSolarDate(date: Date, lang: UiLang, formatNumber: FormatNumber): string {
  const { year, month, day } = toSolarHijri(date);
  const weekday = WEEKDAYS[lang][date.getDay()];
  const separator = lang === "english" ? ", " : "، ";
  return `${weekday}${separator}${formatNumber(day)} ${SOLAR_MONTHS[lang][month - 1]} ${formatNumber(year)} ${ERA.solar[lang]}`;
}
