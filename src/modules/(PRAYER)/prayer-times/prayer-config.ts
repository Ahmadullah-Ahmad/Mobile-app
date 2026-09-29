import type { TranslationKey } from "@/i18n/messages";

export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
export type AlertPrayer = Exclude<PrayerName, "sunrise">;

export const PRAYER_ORDER: PrayerName[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
export const ALERT_PRAYERS: AlertPrayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export const PRAYER_LABEL: Record<PrayerName, TranslationKey> = {
  fajr: "prayerFajr",
  sunrise: "prayerSunrise",
  dhuhr: "prayerDhuhr",
  asr: "prayerAsr",
  maghrib: "prayerMaghrib",
  isha: "prayerIsha",
};

export const isAlertPrayer = (name: PrayerName): name is AlertPrayer => name !== "sunrise";

export interface LatLng {
  lat: number;
  lng: number;
}

// Afghanistan is UTC+4:30 all year (no daylight saving).
export const AFGHANISTAN_UTC_OFFSET = 270;

export type LocationSource = "default" | "gps" | "search";

export interface PrayerLocation extends LatLng {
  name: string | null;
  countryCode: string | null;
  source: LocationSource;
}

export const DEFAULT_LOCATION: PrayerLocation = {
  lat: 34.5553,
  lng: 69.2075,
  name: null,
  countryCode: "AF",
  source: "default",
};

export function isPrayerLocation(value: unknown): value is PrayerLocation {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.lat === "number" &&
    typeof v.lng === "number" &&
    (v.source === "default" || v.source === "gps" || v.source === "search")
  );
}

// Places in Afghanistan use Afghan time; anywhere else the phone's own clock is local time.
export const utcOffsetFor = (countryCode: string | null) =>
  countryCode?.toUpperCase() === "AF" ? AFGHANISTAN_UTC_OFFSET : null;

export const SEARCH_MIN_CHARS = 2;
export const SEARCH_DEBOUNCE_MS = 500;
export const SEARCH_MAX_RESULTS = 5;
// Refresh a GPS location on app open only after moving this far (km).
export const GPS_REFRESH_KM = 5;

export type PrayerAlerts = Partial<Record<AlertPrayer, boolean>>;

export const isPrayerAlerts = (value: unknown): value is PrayerAlerts =>
  !!value && typeof value === "object" && !Array.isArray(value);

// iOS keeps at most 64 pending local notifications per app.
export const MAX_SCHEDULED_ALERTS = 60;
export const MAX_ALERT_DAYS = 14;
export const ALERT_CHANNEL_ID = "prayer-times";
