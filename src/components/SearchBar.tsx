import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type SearchBarProps = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
};

export function SearchBar({ value, placeholder, onChangeText, onSubmitEditing }: SearchBarProps) {
  const hasValue = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchIconWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
      </View>

      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {hasValue ? (
        <TouchableOpacity
          style={styles.clearButton}
          activeOpacity={0.82}
          onPress={() => onChangeText("")}
        >
          <Text style={styles.clearText}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 62,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.soft,
  },

  searchIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  searchIcon: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: typography.weightBlack,
    marginTop: -1,
  },

  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    paddingVertical: 0,
  },

  clearButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },

  clearText: {
    color: colors.textSecondary,
    fontSize: typography.h3,
    fontWeight: typography.weightBlack,
    marginTop: -2,
  },
});
