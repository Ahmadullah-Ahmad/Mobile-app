import { useColorScheme } from "nativewind";

export function useIconColors() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  return {
    foreground: dark ? "#fafafa" : "#0d0d0d",
    muted: dark ? "#d1d5db" : "#737373",
    primary: dark ? "#ffffff" : "#000000",
    // Matches --color-primary-foreground for icons on bg-primary
    primaryForeground: dark ? "#dce8e1" : "#323c37",
  };
}
