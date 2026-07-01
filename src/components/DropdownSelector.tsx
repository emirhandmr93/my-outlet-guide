import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownSelectorProps = {
  label: string;
  selectedLabel: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
};

export function DropdownSelector({
  label,
  selectedLabel,
  options,
  onSelect,
}: DropdownSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.selectedBox, open && styles.selectedBoxOpen]}
        activeOpacity={0.86}
        onPress={() => setOpen((current) => !current)}
      >
        <Text style={styles.selectedText}>{selectedLabel}</Text>
        <Text style={styles.chevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {open ? (
        <View style={styles.optionsBox}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, index === options.length - 1 && styles.optionLast]}
              activeOpacity={0.86}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },

  selectedBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadows.card,
  },

  selectedBoxOpen: {
    borderColor: colors.gold,
  },

  selectedText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: "900",
  },

  chevron: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "900",
    marginLeft: spacing.md,
  },

  optionsBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.card,
  },

  option: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  optionLast: {
    borderBottomWidth: 0,
  },

  optionText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
});
