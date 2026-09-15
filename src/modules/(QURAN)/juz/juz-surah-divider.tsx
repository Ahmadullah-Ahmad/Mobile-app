import { View } from "react-native";

import { SURAH_PREFIX, showsOpeningBismillah } from "@/lib/constants";
import AppText from "@/UI/app-text";
import BismillahBanner from "@/UI/bismillah-banner";

export default function JuzSurahDivider({ name, number }: { name: string; number: number }) {
  return (
    <View style={{ alignItems: "center", paddingTop: 14 }}>
      <AppText variant="quran" size={22} lineHeight={1.9} align="center">
        {`${SURAH_PREFIX} ${name}`}
      </AppText>
      {showsOpeningBismillah(number) ? <BismillahBanner /> : null}
    </View>
  );
}
