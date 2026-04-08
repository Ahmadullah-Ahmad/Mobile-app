import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";

import type { TranslationLang } from "../api/types";
import { LANG_LABELS } from "../lib/constants";
import ScreenHeader from "./screen-header";

/**
 * Translation language picker — extracted as a sibling so TypeScript can
 * narrow `lang`/`onLangChange` from optional to required at the call site.
 */
function LanguagePicker({
  lang,
  onLangChange,
}: {
  lang: TranslationLang;
  onLangChange: (lang: TranslationLang) => void;
}) {
  const { muted } = useIconColors();
  const [open, setOpen] = useState(false);

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <DropdownTrigger>
        <View className="flex-row items-center gap-1 bg-muted rounded-full px-3 py-1.5">
          <Text className="text-sm font-medium">{LANG_LABELS[lang]}</Text>
          <Ionicons name="chevron-down" size={14} color={muted} />
        </View>
      </DropdownTrigger>
      <DropdownContent align="end">
        <DropdownItem
          icon="language-outline"
          onSelect={() => onLangChange("pashto")}
          shortcut={lang === "pashto" ? "✓" : undefined}
        >
          پښتو
        </DropdownItem>
        <DropdownItem
          icon="language-outline"
          onSelect={() => onLangChange("dari")}
          shortcut={lang === "dari" ? "✓" : undefined}
        >
          دری
        </DropdownItem>
        <DropdownItem
          icon="layers-outline"
          onSelect={() => onLangChange("both")}
          shortcut={lang === "both" ? "✓" : undefined}
        >
          دواړه
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem
          icon="book-outline"
          onSelect={() => onLangChange("none")}
          shortcut={lang === "none" ? "✓" : undefined}
        >
          یوازې عربي
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}

interface ReaderHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * Language picker is rendered only when both `lang` and `onLangChange`
   * are provided. Screens that don't need translation switching (e.g. list
   * screens, settings, error pages) can omit them and the dropdown slot
   * collapses to an empty spacer.
   */
  lang?: TranslationLang;
  onLangChange?: (lang: TranslationLang) => void;
}

export default function ReaderHeader({
  title,
  subtitle,
  lang,
  onLangChange,
}: ReaderHeaderProps) {
  return (
    <ScreenHeader
      title={title}
      subtitle={subtitle}
      right={
        lang !== undefined && onLangChange !== undefined ? (
          <LanguagePicker lang={lang} onLangChange={onLangChange} />
        ) : undefined
      }
    />
  );
}
