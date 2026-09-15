import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";
import CardRow from "@/UI/card-row";
import Icon from "@/UI/icon";
import NumberBadge from "@/UI/number-badge";

import type { Juz } from "./juz-config";

interface JuzRowProps {
  juz: Juz;
  active: boolean;
  onPress: (juz: Juz) => void;
}

export default function JuzRow({ juz, active, onPress }: JuzRowProps) {
  const palette = usePalette();
  const { formatNumber } = useSharedUiLang();

  return (
    <CardRow
      radius={26}
      paddingVertical={12}
      paddingHorizontal={16}
      gap={14}
      onPress={() => onPress(juz)}
    >
      <NumberBadge
        label={formatNumber(juz.number)}
        size={40}
        fontSize={17}
        backgroundColor={active ? palette.accent : palette.juzBadge}
        color={active ? palette.onAccent : palette.ink}
      />
      <AppText variant="amiri" size={19} align="start" style={{ flex: 1 }}>
        {juz.name_arabic}
      </AppText>
      <Icon name="chevronForward" size={18} color={palette.ink2} />
    </CardRow>
  );
}
