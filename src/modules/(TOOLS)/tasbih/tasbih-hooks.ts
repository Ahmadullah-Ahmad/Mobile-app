import * as Haptics from "expo-haptics";
import { useCallback } from "react";

import { useDraftSetting } from "@/hooks/use-draft-setting";

import { DEFAULT_TASBIH, DHIKR_LIST, isTasbihState, type Target } from "./tasbih-config";

export function useTasbih() {
  const [state, setState] = useDraftSetting("tasbih", DEFAULT_TASBIH, isTasbihState);
  const dhikr = DHIKR_LIST.find((d) => d.id === state.dhikrId) ?? DHIKR_LIST[0];
  const count = state.counts[dhikr.id] ?? 0;
  const total = Object.values(state.counts).reduce((sum, n) => sum + n, 0);

  const increment = useCallback(() => {
    setState((prev) => {
      const id = prev.dhikrId;
      const next = (prev.counts[id] ?? 0) + 1;
      const completed = prev.target !== 0 && next % prev.target === 0;
      if (completed) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return { ...prev, counts: { ...prev.counts, [id]: next } };
    });
  }, [setState]);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, counts: { ...prev.counts, [prev.dhikrId]: 0 } }));
  }, [setState]);

  const selectDhikr = useCallback((dhikrId: string) => setState((prev) => ({ ...prev, dhikrId })), [setState]);
  const selectTarget = useCallback((target: Target) => setState((prev) => ({ ...prev, target })), [setState]);

  return { dhikr, count, total, target: state.target, increment, reset, selectDhikr, selectTarget };
}
