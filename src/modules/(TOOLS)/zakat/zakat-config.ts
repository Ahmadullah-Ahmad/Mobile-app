import type { TranslationKey } from "@/i18n/messages";
import { toArabicNumeral } from "@/lib/utils";

export const ZAKAT_RATE = 0.025;
export const GOLD_NISAB_GRAMS = 87.48;
export const SILVER_NISAB_GRAMS = 612.36;

export type NisabBasis = "silver" | "gold";

export type ZakatField =
  | "cash"
  | "goldGrams"
  | "goldPrice"
  | "silverGrams"
  | "silverPrice"
  | "trade"
  | "receivables"
  | "debts";

export interface ZakatSection {
  titleKey: TranslationKey;
  fields: { key: ZakatField; labelKey: TranslationKey }[];
}

export const ZAKAT_SECTIONS: ZakatSection[] = [
  { titleKey: "zakatCashSection", fields: [{ key: "cash", labelKey: "zakatCash" }] },
  {
    titleKey: "zakatGoldSection",
    fields: [
      { key: "goldGrams", labelKey: "zakatGrams" },
      { key: "goldPrice", labelKey: "zakatPricePerGram" },
    ],
  },
  {
    titleKey: "zakatSilverSection",
    fields: [
      { key: "silverGrams", labelKey: "zakatGrams" },
      { key: "silverPrice", labelKey: "zakatPricePerGram" },
    ],
  },
  {
    titleKey: "zakatBusinessSection",
    fields: [
      { key: "trade", labelKey: "zakatTrade" },
      { key: "receivables", labelKey: "zakatReceivables" },
    ],
  },
  { titleKey: "zakatDebtsSection", fields: [{ key: "debts", labelKey: "zakatDebts" }] },
];

export interface ZakatInputs {
  basis: NisabBasis;
  values: Partial<Record<ZakatField, string>>;
}

export const DEFAULT_ZAKAT: ZakatInputs = { basis: "silver", values: {} };

export const isZakatInputs = (value: unknown): value is ZakatInputs =>
  !!value &&
  typeof value === "object" &&
  ((value as ZakatInputs).basis === "silver" || (value as ZakatInputs).basis === "gold") &&
  typeof (value as ZakatInputs).values === "object";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function parseAmount(text: string | undefined): number {
  if (!text) return 0;
  const normalized = text
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[٫]/g, ".")
    .replace(/[,٬\s]/g, "");
  const n = parseFloat(normalized);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function calculateZakat({ basis, values }: ZakatInputs) {
  const v = (key: ZakatField) => parseAmount(values[key]);
  const gold = v("goldGrams") * v("goldPrice");
  const silver = v("silverGrams") * v("silverPrice");
  const assets = v("cash") + gold + silver + v("trade") + v("receivables");
  const net = Math.max(0, assets - v("debts"));

  const pricePerGram = basis === "silver" ? v("silverPrice") : v("goldPrice");
  const nisab = pricePerGram > 0 ? pricePerGram * (basis === "silver" ? SILVER_NISAB_GRAMS : GOLD_NISAB_GRAMS) : null;
  const eligible = nisab !== null && net >= nisab && net > 0;

  return { assets, net, nisab, eligible, due: eligible ? net * ZAKAT_RATE : 0 };
}

export function formatAmount(n: number, localizeDigits: boolean): string {
  const rounded = Math.round(n * 100) / 100;
  const [whole, fraction] = rounded.toFixed(Number.isInteger(rounded) ? 0 : 2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const text = fraction ? `${grouped}.${fraction}` : grouped;
  return localizeDigits ? toArabicNumeral(text) : text;
}
