import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePersistedSetting } from "@/hooks/use-persisted-setting";

import { prayerMoments, wallClock } from "./prayer-calc";
import {
  DEFAULT_LOCATION,
  GPS_REFRESH_KM,
  isPrayerAlerts,
  isPrayerLocation,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MAX_RESULTS,
  SEARCH_MIN_CHARS,
  utcOffsetFor,
  type AlertPrayer,
  type LatLng,
  type LocationSource,
  type PrayerAlerts,
  type PrayerLocation,
} from "./prayer-config";

export interface ResolvedLocation extends LatLng {
  label: string;
  source: LocationSource;
  utcOffset: number | null;
}

export interface Place extends LatLng {
  name: string | null;
  country: string | null;
  countryCode: string | null;
}

export function usePrayerLocation() {
  const { t } = useSharedUiLang();
  const [location, setLocation] = usePersistedSetting<PrayerLocation>(
    "prayerLocation",
    DEFAULT_LOCATION,
    isPrayerLocation
  );

  const resolved = useMemo<ResolvedLocation>(
    () => ({
      lat: location.lat,
      lng: location.lng,
      label: location.name ?? t(location.source === "default" ? "defaultCity" : "myLocation"),
      source: location.source,
      utcOffset: utcOffsetFor(location.countryCode),
    }),
    [location, t]
  );

  return { location: resolved, rawLocation: location, setLocation };
}

async function describePlace({ lat, lng }: LatLng): Promise<Place> {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    return {
      lat,
      lng,
      name: place?.city ?? place?.subregion ?? place?.region ?? null,
      country: place?.country ?? null,
      countryCode: place?.isoCountryCode ?? null,
    };
  } catch {
    return { lat, lng, name: null, country: null, countryCode: null };
  }
}

const toLocation = (place: Place, source: LocationSource): PrayerLocation => ({
  lat: place.lat,
  lng: place.lng,
  name: place.name,
  countryCode: place.countryCode,
  source,
});

function distanceKm(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 12_742 * Math.asin(Math.sqrt(h));
}

async function currentCoords(): Promise<LatLng> {
  const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { lat: coords.latitude, lng: coords.longitude };
}

export function useLocateMe() {
  const { setLocation } = usePrayerLocation();
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  const locate = useCallback(async (): Promise<boolean> => {
    setLocating(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      setDenied(!granted);
      if (!granted) return false;
      await setLocation(toLocation(await describePlace(await currentCoords()), "gps"));
      return true;
    } catch (e) {
      if (__DEV__) console.warn("locate failed:", e);
      return false;
    } finally {
      setLocating(false);
    }
  }, [setLocation]);

  return { locate, locating, denied };
}

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

// First launch: ask once for GPS. Later launches: follow a GPS user who travelled.
export function useAutoLocate() {
  const { rawLocation, setLocation } = usePrayerLocation();
  const [asked, setAsked] = usePersistedSetting("locationAsked", false, isBoolean);
  const { locate } = useLocateMe();

  useEffect(() => {
    if (rawLocation.source !== "default" || asked) return;
    setAsked(true);
    locate();
  }, [rawLocation.source, asked, setAsked, locate]);

  useEffect(() => {
    if (rawLocation.source !== "gps") return;

    const refresh = async () => {
      try {
        if (!(await Location.getForegroundPermissionsAsync()).granted) return;
        const coords = await currentCoords();
        if (distanceKm(coords, rawLocation) < GPS_REFRESH_KM) return;
        await setLocation(toLocation(await describePlace(coords), "gps"));
      } catch {
        // Keep the saved location when GPS is unavailable.
      }
    };

    refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, [rawLocation, setLocation]);
}

interface SearchOutcome {
  query: string;
  results: Place[];
  failed: boolean;
}

export function usePlaceSearch(query: string) {
  const [outcome, setOutcome] = useState<SearchOutcome>({ query: "", results: [], failed: false });
  const trimmed = query.trim();
  const active = trimmed.length >= SEARCH_MIN_CHARS;

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const found = await Location.geocodeAsync(trimmed);
        const places = await Promise.all(
          found.slice(0, SEARCH_MAX_RESULTS).map((f) => describePlace({ lat: f.latitude, lng: f.longitude }))
        );
        const unique = places.filter(
          (p, i) => places.findIndex((q) => q.name === p.name && q.country === p.country) === i
        );
        if (!cancelled) setOutcome({ query: trimmed, results: unique, failed: false });
      } catch {
        if (!cancelled) setOutcome({ query: trimmed, results: [], failed: true });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, active]);

  const current = active && outcome.query === trimmed;
  return {
    results: current ? outcome.results : [],
    searching: active && !current,
    failed: current && outcome.failed,
    active,
  };
}

export function useSelectPlace() {
  const { setLocation } = usePrayerLocation();
  return useCallback((place: Place) => setLocation(toLocation(place, "search")), [setLocation]);
}

export function usePrayerMoments(now: Date) {
  const { location } = usePrayerLocation();
  const minute = Math.floor(now.getTime() / 60_000);
  return useMemo(
    () => prayerMoments(location, now, location.utcOffset),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.lat, location.lng, location.utcOffset, minute]
  );
}

export function usePrayerAlerts() {
  const [alerts, setAlerts] = usePersistedSetting<PrayerAlerts>("prayerAlerts", {}, isPrayerAlerts);

  const toggleAlert = useCallback(
    (prayer: AlertPrayer, enabled: boolean) => setAlerts({ ...alerts, [prayer]: enabled }),
    [alerts, setAlerts]
  );

  return { alerts, toggleAlert };
}

export function useTimeFormat() {
  const { t, formatNumber } = useSharedUiLang();
  const { location } = usePrayerLocation();
  const { utcOffset } = location;

  const formatTime = useCallback(
    (date: Date) => {
      const wall = wallClock(date, utcOffset);
      const hours = wall.getHours();
      const minutes = wall.getMinutes();
      const hour12 = hours % 12 === 0 ? 12 : hours % 12;
      const mm = `${minutes < 10 ? formatNumber(0) : ""}${formatNumber(minutes)}`;
      return `${formatNumber(hour12)}:${mm} ${t(hours < 12 ? "am" : "pm")}`;
    },
    [t, formatNumber, utcOffset]
  );

  const toLocalDate = useCallback((date: Date) => wallClock(date, utcOffset), [utcOffset]);

  const formatCountdown = useCallback(
    (from: Date, to: Date) => {
      const total = Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 60_000));
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      return hours > 0 ? t("inHoursMinutes", { hours, minutes }) : t("inMinutes", { minutes });
    },
    [t]
  );

  return { formatTime, formatCountdown, toLocalDate };
}
