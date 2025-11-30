import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DueDatePicker } from "@/components/DueDatePicker";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Category } from "@/constants/categories";
import type { TasksStackParamList } from "@/navigation/TasksStackNavigator";

type AddTaskScreenProps = {
  navigation: NativeStackNavigationProp<TasksStackParamList, "AddTask">;
};

export default function AddTaskScreen({ navigation }: AddTaskScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("none");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <ThemedText type="body" style={{ color: theme.link }}>
            Abbrechen
          </ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={saving || !title.trim()}
          hitSlop={8}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.link} />
          ) : (
            <ThemedText
              type="body"
              style={{
                color: theme.link,
                fontWeight: "600",
                opacity: title.trim() ? 1 : 0.5,
              }}
            >
              Speichern
            </ThemedText>
          )}
        </Pressable>
      ),
    });
  }, [navigation, theme, title, saving]);

  const handleSave = async () => {
    if (!title.trim() || !user) return;

    setError("");
    setSaving(true);

    try {
      await addDoc(collection(db, "todos"), {
        title: title.trim(),
        done: false,
        userId: user.uid,
        categoryId: categoryId,
        dueDate: dueDate ? dueDate.getTime() : null,
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("Fehler beim Speichern");
      setSaving(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setCategoryId(category.id);
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Aufgabe eingeben..."
          placeholderTextColor={theme.placeholder}
          autoCapitalize="sentences"
          returnKeyType="done"
          onSubmitEditing={handleSave}
          editable={!saving}
          multiline={false}
        />

        <CategoryPicker
          selectedId={categoryId}
          onSelect={handleCategorySelect}
        />

        <DueDatePicker value={dueDate} onChange={setDueDate} />

        {error ? (
          <ThemedText
            type="small"
            style={[styles.errorText, { color: theme.destructive }]}
          >
            {error}
          </ThemedText>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
  },
  errorText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
});
