import { useEffect, useState } from "react";
import { AppState } from "react-native";

// Ticks on each minute boundary and stops while the app is in the background.
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const current = new Date();
      setNow(current);
      const untilNextMinute = 60_000 - (current.getSeconds() * 1000 + current.getMilliseconds());
      timer = setTimeout(tick, untilNextMinute + 50);
    };

    timer = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    const subscription = AppState.addEventListener("change", (state) => {
      clearTimeout(timer);
      if (state === "active") tick();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return now;
}
