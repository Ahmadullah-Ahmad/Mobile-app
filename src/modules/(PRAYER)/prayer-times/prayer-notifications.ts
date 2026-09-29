import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { AppState, Platform } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";

import { scheduleForDay } from "./prayer-calc";
import {
  ALERT_CHANNEL_ID,
  ALERT_PRAYERS,
  MAX_ALERT_DAYS,
  MAX_SCHEDULED_ALERTS,
  PRAYER_LABEL,
  type AlertPrayer,
  type LatLng,
  type PrayerAlerts,
} from "./prayer-config";
import { usePrayerAlerts, usePrayerLocation } from "./prayer-hooks";

const SUPPORTED = Platform.OS !== "web";

if (SUPPORTED) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestAlertPermission(): Promise<boolean> {
  if (!SUPPORTED) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

interface ScheduleInput {
  location: LatLng;
  utcOffset: number | null;
  alerts: PrayerAlerts;
  title: (prayer: AlertPrayer) => string;
  body: string;
  channelName: string;
}

async function scheduleAlerts({ location, utcOffset, alerts, title, body, channelName }: ScheduleInput) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const enabled = ALERT_PRAYERS.filter((prayer) => alerts[prayer]);
  if (enabled.length === 0) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
      name: channelName,
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  const now = new Date();
  const days = Math.min(MAX_ALERT_DAYS, Math.floor(MAX_SCHEDULED_ALERTS / enabled.length));
  for (let day = 0; day < days; day++) {
    const schedule = scheduleForDay(location, now, utcOffset, day);
    for (const prayer of enabled) {
      const time = schedule[prayer];
      if (time <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: title(prayer), body, sound: "default" },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: time,
          channelId: ALERT_CHANNEL_ID,
        },
      });
    }
  }
}

let queue: Promise<void> = Promise.resolve();

// Keeps a rolling window of alerts scheduled; mounted once in the tab layout.
export function usePrayerAlertSync() {
  const { t } = useSharedUiLang();
  const { location } = usePrayerLocation();
  const { alerts } = usePrayerAlerts();

  useEffect(() => {
    if (!SUPPORTED) return;

    const sync = () => {
      queue = queue
        .then(() =>
          scheduleAlerts({
            location,
            utcOffset: location.utcOffset,
            alerts,
            title: (prayer) => t("prayerAlertTitle", { prayer: t(PRAYER_LABEL[prayer]) }),
            body: location.label,
            channelName: t("prayerTimes"),
          })
        )
        .catch((e) => {
          if (__DEV__) console.warn("prayer alert sync failed:", e);
        });
    };

    sync();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });
    return () => subscription.remove();
  }, [location, alerts, t]);
}
