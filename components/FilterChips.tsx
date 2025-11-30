import React from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { CATEGORIES } from "@/constants/categories";

export type FilterStatus = "all" | "active" | "done";

interface FilterChipsProps {
  selectedStatus: FilterStatus;
  selectedCategoryId: string | null;
  onStatusChange: (status: FilterStatus) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

const STATUS_OPTIONS: { id: FilterStatus; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "active", label: "Offen" },
  { id: "done", label: "Erledigt" },
];

export function FilterChips({
  selectedStatus,
  selectedCategoryId,
  onStatusChange,
  onCategoryChange,
}: FilterChipsProps) {
  const { theme, isDark } = useTheme();

  const categoryOptions = CATEGORIES.filter((cat) => cat.id !== "none");

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STATUS_OPTIONS.map((option) => {
          const isSelected = option.id === selectedStatus;
          return (
            <Pressable
              key={option.id}
              onPress={() => onStatusChange(option.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? theme.link
                    : theme.backgroundDefault,
                  borderColor: isSelected ? theme.link : theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.chipText,
                  { color: isSelected ? "#FFFFFF" : theme.text },
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}

        <View style={styles.divider} />

        {categoryOptions.map((category) => {
          const isSelected = category.id === selectedCategoryId;
          return (
            <Pressable
              key={category.id}
              onPress={() =>
                onCategoryChange(isSelected ? null : category.id)
              }
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? category.color
                    : theme.backgroundDefault,
                  borderColor: isSelected ? category.color : theme.border,
                },
              ]}
            >
              {isSelected ? (
                <Feather
                  name="check"
                  size={12}
                  color="#FFFFFF"
                  style={styles.checkIcon}
                />
              ) : null}
              <ThemedText
                type="small"
                style={[
                  styles.chipText,
                  { color: isSelected ? "#FFFFFF" : category.color },
                ]}
              >
                {category.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  scrollContent: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  checkIcon: {
    marginRight: Spacing.xs,
  },
  chipText: {
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: Spacing.xs,
  },
});
