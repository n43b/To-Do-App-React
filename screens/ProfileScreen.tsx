import React, { useState } from "react";
import { StyleSheet, View, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <View
          style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="user" size={40} color={theme.textSecondary} />
        </View>

        <Spacer height={Spacing.xl} />

        <ThemedText type="h3" style={styles.email}>
          {user?.email || "Nicht angemeldet"}
        </ThemedText>
      </View>

      <Spacer height={Spacing["4xl"]} />

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.sectionRow}>
          <Feather name="mail" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={styles.sectionLabel}>
            E-Mail
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.sectionValue, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {user?.email || "-"}
          </ThemedText>
        </View>
      </View>

      <Spacer height={Spacing["4xl"]} />

      {loading ? (
        <ActivityIndicator size="large" color={theme.link} />
      ) : (
        <Button
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            { backgroundColor: isDark ? Colors.dark.destructive : Colors.light.destructive },
          ]}
        >
          Abmelden
        </Button>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: Spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  email: {
    textAlign: "center",
  },
  section: {
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  sectionLabel: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  sectionValue: {
    maxWidth: "50%",
  },
  logoutButton: {},
});
