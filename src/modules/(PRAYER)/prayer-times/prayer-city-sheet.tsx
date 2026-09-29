import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";
import CardRow from "@/UI/card-row";
import DrawerPanel, { useDrawerBottomSpace } from "@/UI/drawer-panel";
import Icon from "@/UI/icon";
import SearchInput from "@/UI/search-input";

import { useLocateMe, usePlaceSearch, usePrayerLocation, useSelectPlace, type Place } from "./prayer-hooks";

interface PrayerCitySheetProps {
  open: boolean;
  onClose: () => void;
}

export default function PrayerCitySheet({ open, onClose }: PrayerCitySheetProps) {
  const palette = usePalette();
  const { t } = useSharedUiLang();
  const bottomSpace = useDrawerBottomSpace();
  const { location } = usePrayerLocation();
  const { locate, locating, denied } = useLocateMe();
  const [query, setQuery] = useState("");
  const { results, searching, failed, active } = usePlaceSearch(query);
  const selectPlace = useSelectPlace();

  const close = () => {
    setQuery("");
    onClose();
  };

  const pickGps = async () => {
    if (await locate()) close();
  };

  const pickPlace = (place: Place) => {
    selectPlace(place);
    close();
  };

  const usingGps = location.source === "gps";

  return (
    <DrawerPanel open={open} onClose={close} title={t("chooseCity")} subtitle={t("chooseCitySub")}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: bottomSpace, gap: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CardRow
          radius={24}
          paddingVertical={14}
          paddingHorizontal={16}
          gap={12}
          onPress={locating ? undefined : pickGps}
          style={usingGps ? { backgroundColor: palette.accentSoft } : undefined}
        >
          {locating ? (
            <ActivityIndicator color={palette.accent} />
          ) : (
            <Icon name="locate" size={20} color={palette.accent} />
          )}
          <View style={{ flex: 1 }}>
            <AppText variant="uiMedium" size={14.5} align="start">
              {t("useMyLocation")}
            </AppText>
            <AppText size={12} color={palette.ink2} align="start">
              {usingGps ? location.label : t("useMyLocationSub")}
            </AppText>
          </View>
          {usingGps ? <Icon name="check" size={17} color={palette.accent} /> : null}
        </CardRow>

        {denied ? (
          <Pressable onPress={() => Linking.openSettings()} accessibilityRole="link" style={{ paddingVertical: 6 }}>
            <AppText size={12.5} color={palette.accentText} align="start" style={{ textDecorationLine: "underline" }}>
              {t("locationDenied")}
            </AppText>
          </Pressable>
        ) : null}

        <SearchInput value={query} onChange={setQuery} placeholder={t("searchCity")} style={{ marginTop: 8 }} />

        {searching ? (
          <ActivityIndicator color={palette.accent} style={{ marginVertical: 16 }} />
        ) : active && results.length === 0 ? (
          <AppText size={13} color={palette.ink2} align="center" style={{ marginVertical: 16 }}>
            {t(failed ? "searchCityFailed" : "searchCityEmpty")}
          </AppText>
        ) : (
          results.map((place) => (
            <CardRow
              key={`${place.lat},${place.lng}`}
              radius={20}
              paddingVertical={12}
              paddingHorizontal={16}
              gap={12}
              onPress={() => pickPlace(place)}
            >
              <Icon name="pin" size={17} color={palette.ink2} />
              <View style={{ flex: 1 }}>
                <AppText size={14.5} align="start">
                  {place.name ?? query.trim()}
                </AppText>
                {place.country ? (
                  <AppText size={12} color={palette.ink2} align="start">
                    {place.country}
                  </AppText>
                ) : null}
              </View>
            </CardRow>
          ))
        )}

        {!active && location.source === "search" ? (
          <CardRow radius={20} paddingVertical={12} paddingHorizontal={16} gap={12} style={{ backgroundColor: palette.accent }}>
            <Icon name="pin" size={17} color={palette.onAccent} />
            <AppText size={14.5} color={palette.onAccent} align="start" style={{ flex: 1 }}>
              {location.label}
            </AppText>
            <Icon name="check" size={17} color={palette.onAccent} />
          </CardRow>
        ) : null}
      </ScrollView>
    </DrawerPanel>
  );
}
