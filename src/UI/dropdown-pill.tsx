import { useState } from "react";
import { Pressable } from "react-native";

import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/ui/dropdown";
import { usePalette } from "@/hooks/use-palette";

import AppText from "./app-text";
import Icon from "./icon";

interface DropdownPillProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

const isLatin = (label: string) => /^[A-Za-z]/.test(label);

export default function DropdownPill<T extends string>({ options, value, onChange }: DropdownPillProps<T>) {
  const palette = usePalette();
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value) ?? options[0];

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <DropdownTrigger asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          style={{
            minHeight: 40,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            borderRadius: 999,
            backgroundColor: palette.panel,
          }}
        >
          <AppText variant={isLatin(current.label) ? "latin" : "naskh"} size={13.5}>
            {current.label}
          </AppText>
          <Icon name="chevronDown" size={14} color={palette.chipOff} strokeWidth={2.5} />
        </Pressable>
      </DropdownTrigger>
      <DropdownContent align="end">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <DropdownItem key={option.value} onSelect={() => onChange(option.value)}>
              <AppText
                variant={isLatin(option.label) ? "latin" : "naskh"}
                size={15}
                color={active ? palette.accent : palette.chipOff}
              >
                {option.label}
              </AppText>
            </DropdownItem>
          );
        })}
      </DropdownContent>
    </Dropdown>
  );
}
