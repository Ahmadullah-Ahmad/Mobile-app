import { Caprasimo_400Regular } from "@expo-google-fonts/caprasimo/400Regular";
import { Figtree_400Regular } from "@expo-google-fonts/figtree/400Regular";
import { NotoNaskhArabic_400Regular } from "@expo-google-fonts/noto-naskh-arabic/400Regular";
import { NotoNaskhArabic_500Medium } from "@expo-google-fonts/noto-naskh-arabic/500Medium";

export const FONTS = {
  quran: "AmiriQuran",
  amiri: "Amiri",
  naskh: "NotoNaskhArabic",
  naskhMedium: "NotoNaskhArabic-Medium",
  latin: "Figtree",
  heading: "Caprasimo",
} as const;

export const FONT_ASSETS = {
  [FONTS.quran]: require("../../assets/fonts/AmiriQuran.ttf"),
  [FONTS.amiri]: require("../../assets/fonts/Amiri-Regular.ttf"),
  [FONTS.naskh]: NotoNaskhArabic_400Regular,
  [FONTS.naskhMedium]: NotoNaskhArabic_500Medium,
  [FONTS.latin]: Figtree_400Regular,
  [FONTS.heading]: Caprasimo_400Regular,
};
