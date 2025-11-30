import React, { useState } from "react";
import { StyleSheet, View, Pressable, Platform, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface DueDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Heute";
    if (isTomorrow) return "Morgen";

    return date.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(null);
    setShowPicker(false);
  };

  const handleOpenPicker = () => {
    setTempDate(value || new Date());
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={styles.label}>
        Fälligkeitsdatum
      </ThemedText>
      <View style={styles.row}>
        <Pressable
          onPress={handleOpenPicker}
          style={[
            styles.dateButton,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <Feather
            name="calendar"
            size={18}
            color={value ? theme.link : theme.placeholder}
            style={styles.icon}
          />
          <ThemedText
            type="body"
            style={[
              styles.dateText,
              !value && { color: theme.placeholder },
            ]}
          >
            {value ? formatDate(value) : "Kein Datum"}
          </ThemedText>
        </Pressable>
        {value ? (
          <Pressable
            onPress={handleClear}
            style={[styles.clearButton, { backgroundColor: theme.backgroundDefault }]}
            hitSlop={8}
          >
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {Platform.OS === "ios" && showPicker ? (
        <Modal
          visible={showPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={[styles.modalHeader, { borderColor: theme.border }]}>
                <Pressable onPress={() => setShowPicker(false)}>
                  <ThemedText type="body" style={{ color: theme.link }}>
                    Abbrechen
                  </ThemedText>
                </Pressable>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Datum wählen
                </ThemedText>
                <Pressable onPress={handleConfirm}>
                  <ThemedText
                    type="body"
                    style={{ color: theme.link, fontWeight: "600" }}
                  >
                    Fertig
                  </ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                locale="de-DE"
                style={styles.picker}
              />
              <Pressable
                onPress={handleClear}
                style={[styles.clearFullButton, { borderColor: theme.border }]}
              >
                <ThemedText type="body" style={{ color: theme.destructive }}>
                  Datum entfernen
                </ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        </Modal>
      ) : null}

      {Platform.OS === "android" && showPicker ? (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      ) : null}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  dateText: {
    flex: 1,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    paddingBottom: Spacing["3xl"],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  picker: {
    height: 200,
  },
  clearFullButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.xl,
    borderTopWidth: 1,
  },
});
