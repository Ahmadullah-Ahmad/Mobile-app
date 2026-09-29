import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform } from "react-native";

import { QIBLA_TOLERANCE, angleBetween, isLowAccuracy } from "./qibla-config";

type Permission = "unknown" | "granted" | "denied";

export function useCompassHeading(qibla: number) {
  const rotation = useRef(new Animated.Value(0)).current;
  const angle = useRef(0);
  const [permission, setPermission] = useState<Permission>("unknown");
  const [hasHeading, setHasHeading] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [lowAccuracy, setLowAccuracy] = useState(false);
  const alignedRef = useRef(false);

  const requestPermission = useCallback(async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    setPermission(granted ? "granted" : "denied");
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    Location.getForegroundPermissionsAsync().then(({ granted, canAskAgain }) => {
      if (granted) setPermission("granted");
      else if (canAskAgain) requestPermission();
      else setPermission("denied");
    });
  }, [requestPermission]);

  useEffect(() => {
    if (permission !== "granted") return;
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    Location.watchHeadingAsync(({ trueHeading, magHeading, accuracy }) => {
      const heading = trueHeading >= 0 ? trueHeading : magHeading;
      // Rotate the shortest way so 359° → 1° doesn't spin the dial all the way round.
      const target = -heading;
      const delta = ((target - angle.current + 540) % 360) - 180;
      angle.current += delta;
      Animated.timing(rotation, {
        toValue: angle.current,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      setHasHeading(true);
      setLowAccuracy(isLowAccuracy(accuracy));
      const nowAligned = angleBetween(heading, qibla) <= QIBLA_TOLERANCE;
      if (nowAligned !== alignedRef.current) {
        alignedRef.current = nowAligned;
        setAligned(nowAligned);
        if (nowAligned) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    })
      .then((sub) => {
        if (cancelled) sub.remove();
        else subscription = sub;
      })
      .catch(() => setHasHeading(false));

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [permission, qibla, rotation]);

  return { rotation, permission, requestPermission, hasHeading, aligned, lowAccuracy };
}
