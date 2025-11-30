import React from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { CATEGORIES, Category } from "@/constants/categories";

interface CategoryPickerProps {
  selectedId: string;
  onSelect: (category: Category) => void;
}

export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={styles.label}>
        Kategorie
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = category.id === selectedId;
          return (
            <Pressable
              key={category.id}
              onPress={() => onSelect(category)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? category.color
                    : theme.backgroundDefault,
                  borderColor: category.color,
                },
              ]}
            >
              {isSelected ? (
                <Feather
                  name="check"
                  size={14}
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
    marginTop: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
    opacity: 0.8,
  },
  scrollContent: {
    gap: Spacing.sm,
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
});
