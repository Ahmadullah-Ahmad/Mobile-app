import {
  CalculationMethod,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PolarCircleResolution,
  PrayerTimes,
  Qibla,
} from "adhan";

import { PRAYER_ORDER, type LatLng, type PrayerName } from "./prayer-config";

export type PrayerSchedule = Record<PrayerName, Date>;

export interface PrayerMoment {
  name: PrayerName;
  time: Date;
}

// A Date whose local fields show the wall clock at `utcOffset` minutes; null keeps the device clock.
export function wallClock(date: Date, utcOffset: number | null): Date {
  if (utcOffset === null) return date;
  return new Date(date.getTime() + (utcOffset + date.getTimezoneOffset()) * 60_000);
}

const dayOf = (wall: Date, shift: number) =>
  new Date(wall.getFullYear(), wall.getMonth(), wall.getDate() + shift, 12);

// The Afghan method for every location: Karachi angles (18°/18°) with Hanafi Asr.
export function prayerSchedule({ lat, lng }: LatLng, day: Date): PrayerSchedule {
  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.Karachi();
  params.madhab = Madhab.Hanafi;
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  params.polarCircleResolution = PolarCircleResolution.AqrabYaum;
  const times = new PrayerTimes(coordinates, day, params);

  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

export function scheduleForDay(location: LatLng, now: Date, utcOffset: number | null, shift: number) {
  return prayerSchedule(location, dayOf(wallClock(now, utcOffset), shift));
}

export function prayerMoments(location: LatLng, now: Date, utcOffset: number | null) {
  const today = scheduleForDay(location, now, utcOffset, 0);
  const timeline: PrayerMoment[] = [
    { name: "isha", time: scheduleForDay(location, now, utcOffset, -1).isha },
    ...PRAYER_ORDER.map((name) => ({ name, time: today[name] })),
    { name: "fajr", time: scheduleForDay(location, now, utcOffset, 1).fajr },
  ];

  const nextIndex = timeline.findIndex((moment) => moment.time > now);
  const current = timeline[nextIndex - 1];
  return {
    today,
    current,
    next: timeline[nextIndex],
    currentIsToday: !!current && today[current.name].getTime() === current.time.getTime(),
  };
}

export function qiblaBearing({ lat, lng }: LatLng): number {
  return Qibla(new Coordinates(lat, lng));
}
