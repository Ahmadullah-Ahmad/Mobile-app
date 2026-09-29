import { Platform } from "react-native";

export const QIBLA_TOLERANCE = 5;
export const DIAL_SIZE = 290;

export function angleBetween(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Android reports 0–3 (3 = high); iOS reports the error margin in degrees.
export function isLowAccuracy(accuracy: number): boolean {
  if (Platform.OS === "android") return accuracy < 2;
  return accuracy < 0 || accuracy > 25;
}
