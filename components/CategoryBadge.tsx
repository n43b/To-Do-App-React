import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getCategoryById } from "@/constants/categories";

interface CategoryBadgeProps {
  categoryId: string;
}

export function CategoryBadge({ categoryId }: CategoryBadgeProps) {
  if (!categoryId || categoryId === "none") {
    return null;
  }

  const category = getCategoryById(categoryId);

  return (
    <View style={[styles.badge, { backgroundColor: category.color + "20" }]}>
      <View style={[styles.dot, { backgroundColor: category.color }]} />
      <ThemedText
        type="small"
        style={[styles.text, { color: category.color }]}
      >
        {category.name}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
