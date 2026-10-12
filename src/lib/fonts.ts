import { Caprasimo_400Regular } from "@expo-google-fonts/caprasimo/400Regular";
import { Figtree_400Regular } from "@expo-google-fonts/figtree/400Regular";
import { NotoNaskhArabic_400Regular } from "@expo-google-fonts/noto-naskh-arabic/400Regular";
import { NotoNaskhArabic_500Medium } from "@expo-google-fonts/noto-naskh-arabic/500Medium";
import { Vazirmatn_400Regular } from "@expo-google-fonts/vazirmatn/400Regular";
import { Vazirmatn_500Medium } from "@expo-google-fonts/vazirmatn/500Medium";
import { Platform } from "react-native";

// iOS text layout misplaces Noto Naskh's dots on Pashto letters (ښ), so Pashto/Dari text uses Vazirmatn there.
const IOS = Platform.OS === "ios";

export const FONTS = {
  quran: "AmiriQuran",
  amiri: "Amiri",
  naskh: IOS ? "Vazirmatn" : "NotoNaskhArabic",
  naskhMedium: IOS ? "Vazirmatn-Medium" : "NotoNaskhArabic-Medium",
  latin: "Figtree",
  heading: "Caprasimo",
} as const;

export const FONT_ASSETS = {
  [FONTS.quran]: require("../../assets/fonts/AmiriQuran.ttf"),
  [FONTS.amiri]: require("../../assets/fonts/Amiri-Regular.ttf"),
  [FONTS.naskh]: IOS ? Vazirmatn_400Regular : NotoNaskhArabic_400Regular,
  [FONTS.naskhMedium]: IOS ? Vazirmatn_500Medium : NotoNaskhArabic_500Medium,
  [FONTS.latin]: Figtree_400Regular,
  [FONTS.heading]: Caprasimo_400Regular,
};
