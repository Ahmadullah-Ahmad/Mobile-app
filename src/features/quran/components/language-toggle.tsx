import { cn } from "@/lib/utils";
import { TranslationLang } from "@/hooks/use-quran";
import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { Pressable } from "react-native";

interface Option {
  value: TranslationLang;
  label: string;
}

const OPTIONS: Option[] = [
  { value: "pashto", label: "پښتو" },
  { value: "dari",   label: "دری" },
  { value: "both",   label: "دواړه" },
  { value: "none",   label: "عربي" },
];

interface Props {
  value: TranslationLang;
  onChange: (lang: TranslationLang) => void;
}

export default function LanguageToggle({ value, onChange }: Props) {
  return (
    <View className="flex-row bg-muted flex rounded-xl p-1 gap-1">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              "flex-1 items-center justify-center py-1.5 rounded-lg",
              active ? "bg-primary" : "bg-transparent"
            )}
          >
            <Text
              style={{ fontFamily: undefined, writingDirection: "rtl" }}
              className={cn(
                "text-sm font-medium",
                active ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
