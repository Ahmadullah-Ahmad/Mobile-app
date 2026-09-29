import { useCallback, useMemo } from "react";

import { useDraftSetting } from "@/hooks/use-draft-setting";

import { calculateZakat, DEFAULT_ZAKAT, isZakatInputs, type NisabBasis, type ZakatField } from "./zakat-config";

export function useZakat() {
  const [inputs, setInputs] = useDraftSetting("zakat", DEFAULT_ZAKAT, isZakatInputs);
  const result = useMemo(() => calculateZakat(inputs), [inputs]);

  const setField = useCallback(
    (key: ZakatField, text: string) => setInputs((prev) => ({ ...prev, values: { ...prev.values, [key]: text } })),
    [setInputs]
  );
  const setBasis = useCallback((basis: NisabBasis) => setInputs((prev) => ({ ...prev, basis })), [setInputs]);
  const clear = useCallback(() => setInputs((prev) => ({ ...prev, values: {} })), [setInputs]);

  return { inputs, result, setField, setBasis, clear };
}
