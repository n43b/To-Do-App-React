import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips, FilterStatus } from "@/components/FilterChips";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { TasksStackParamList } from "@/navigation/TasksStackNavigator";

interface Todo {
  id: string;
  title: string;
  done: boolean;
  userId: string;
  categoryId?: string;
  dueDate?: number;
  createdAt?: any;
}

type TaskListScreenProps = {
  navigation: NativeStackNavigationProp<TasksStackParamList, "TaskList">;
};

type SortOption = "newest" | "oldest" | "name" | "dueDate";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatDueDate(timestamp: number): { text: string; isOverdue: boolean } {
  const date = new Date(timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDay = new Date(timestamp);
  dueDay.setHours(0, 0, 0, 0);

  const isOverdue = dueDay < today;

  if (dueDay.getTime() === today.getTime()) {
    return { text: "Heute", isOverdue: false };
  }
  if (dueDay.getTime() === tomorrow.getTime()) {
    return { text: "Morgen", isOverdue: false };
  }

  const text = date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });

  return { text, isOverdue };
}

function TodoItem({
  item,
  onToggle,
  onDelete,
  onEdit,
}: {
  item: Todo;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, categoryId?: string, dueDate?: number) => void;
}) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const dueDateInfo = item.dueDate ? formatDueDate(item.dueDate) : null;

  return (
    <AnimatedPressable
      onPress={() => onEdit(item.id, item.title, item.categoryId, item.dueDate)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.todoItem,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={() => onToggle(item.id, !item.done)}
        style={styles.checkbox}
        hitSlop={8}
      >
        <Feather
          name={item.done ? "check-circle" : "circle"}
          size={24}
          color={item.done ? (isDark ? Colors.dark.success : Colors.light.success) : theme.placeholder}
        />
      </Pressable>
      <View style={styles.titleContainer}>
        <ThemedText
          type="body"
          style={[
            styles.todoTitle,
            item.done && styles.todoTitleDone,
            item.done && { opacity: 0.5 },
          ]}
          numberOfLines={2}
        >
          {item.title}
        </ThemedText>
        <View style={styles.metaRow}>
          {item.categoryId && item.categoryId !== "none" ? (
            <CategoryBadge categoryId={item.categoryId} />
          ) : null}
          {dueDateInfo && !item.done ? (
            <View
              style={[
                styles.dueDateBadge,
                {
                  backgroundColor: dueDateInfo.isOverdue
                    ? (isDark ? Colors.dark.destructive : Colors.light.destructive) + "20"
                    : theme.link + "15",
                },
              ]}
            >
              <Feather
                name="calendar"
                size={12}
                color={
                  dueDateInfo.isOverdue
                    ? (isDark ? Colors.dark.destructive : Colors.light.destructive)
                    : theme.link
                }
                style={styles.dueDateIcon}
              />
              <ThemedText
                type="small"
                style={[
                  styles.dueDateText,
                  {
                    color: dueDateInfo.isOverdue
                      ? (isDark ? Colors.dark.destructive : Colors.light.destructive)
                      : theme.link,
                  },
                ]}
              >
                {dueDateInfo.text}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
      <Pressable
        onPress={() => onEdit(item.id, item.title, item.categoryId, item.dueDate)}
        style={styles.editButton}
        hitSlop={8}
      >
        <Feather name="edit-2" size={18} color={theme.textSecondary} />
      </Pressable>
      <Pressable
        onPress={() => onDelete(item.id)}
        style={styles.deleteButton}
        hitSlop={8}
      >
        <Feather
          name="trash-2"
          size={20}
          color={isDark ? Colors.dark.destructive : Colors.light.destructive}
        />
      </Pressable>
    </AnimatedPressable>
  );
}

export default function TaskListScreen({ navigation }: TaskListScreenProps) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const fabScale = useSharedValue(1);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  useEffect(() => {
    if (!user) return;

    const todosQuery = query(
      collection(db, "todos"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      todosQuery,
      (snapshot) => {
        const todoList: Todo[] = [];
        snapshot.forEach((document) => {
          todoList.push({ id: document.id, ...document.data() } as Todo);
        });
        setTodos(todoList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching todos:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos;

    result = result.filter((todo) => {
      const matchesSearch = todo.title
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !todo.done) ||
        (filterStatus === "done" && todo.done);
      const matchesCategory =
        !filterCategoryId ||
        (todo.categoryId === filterCategoryId);

      return matchesSearch && matchesStatus && matchesCategory;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        case "name":
          return a.title.localeCompare(b.title, "de");
        case "dueDate":
          const aDate = a.dueDate || Infinity;
          const bDate = b.dueDate || Infinity;
          return aDate - bDate;
        case "newest":
        default:
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });

    return result;
  }, [todos, searchText, filterStatus, filterCategoryId, sortBy]);

  const handleToggle = async (id: string, done: boolean) => {
    try {
      await updateDoc(doc(db, "todos", id), { done });
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleEdit = (id: string, title: string, categoryId?: string, dueDate?: number) => {
    navigation.navigate("EditTask", {
      taskId: id,
      currentTitle: title,
      currentCategoryId: categoryId,
      currentDueDate: dueDate,
    });
  };

  const handleAddPress = () => {
    navigation.navigate("AddTask");
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <TodoItem
      item={item}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="check-circle" size={64} color={theme.placeholder} />
      <ThemedText
        type="h4"
        style={[styles.emptyTitle, { color: theme.textSecondary }]}
      >
        {searchText || filterStatus !== "all" || filterCategoryId
          ? "Keine Ergebnisse"
          : "Keine Aufgaben vorhanden"}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: theme.placeholder }]}
      >
        {searchText || filterStatus !== "all" || filterCategoryId
          ? "Versuche die Filter zu ändern"
          : "Tippe auf + um eine Aufgabe hinzuzufügen"}
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.link} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredAndSortedTodos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Aufgaben durchsuchen..."
            />
            <FilterChips
              selectedStatus={filterStatus}
              selectedCategoryId={filterCategoryId}
              onStatusChange={setFilterStatus}
              onCategoryChange={setFilterCategoryId}
            />
            <View style={[styles.sortRow, { borderColor: theme.border }]}>
              <ThemedText type="small" style={styles.sortLabel}>
                Sortieren nach:
              </ThemedText>
              <View style={styles.sortOptions}>
                {(["newest", "oldest", "name", "dueDate"] as SortOption[]).map(
                  (option) => (
                    <Pressable
                      key={option}
                      onPress={() => setSortBy(option)}
                      style={[
                        styles.sortOption,
                        {
                          backgroundColor:
                            sortBy === option
                              ? theme.link + "20"
                              : theme.backgroundDefault,
                          borderColor:
                            sortBy === option ? theme.link : theme.border,
                        },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={[
                          { color: sortBy === option ? theme.link : theme.text },
                        ]}
                      >
                        {option === "newest"
                          ? "Neu"
                          : option === "oldest"
                          ? "Alt"
                          : option === "name"
                          ? "A-Z"
                          : "Fällig"}
                      </ThemedText>
                    </Pressable>
                  )
                )}
              </View>
            </View>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing["5xl"] + Spacing["2xl"],
          },
        ]}
        ListEmptyComponent={renderEmpty}
        scrollIndicatorInsets={{ bottom: insets.bottom + 16 }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />

      <AnimatedPressable
        onPress={handleAddPress}
        onPressIn={() => {
          fabScale.value = withSpring(0.9, springConfig);
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1, springConfig);
        }}
        style={[
          styles.fab,
          { backgroundColor: theme.link, bottom: tabBarHeight + Spacing.xl },
          fabAnimatedStyle,
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </AnimatedPressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  listContent: {
    paddingHorizontal: 0,
    flexGrow: 1,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    minHeight: 60,
    marginHorizontal: Spacing.xl,
  },
  checkbox: {
    marginRight: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  todoTitle: {
    flex: 0,
  },
  todoTitleDone: {
    textDecorationLine: "line-through",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  dueDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  dueDateIcon: {
    marginRight: 4,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  editButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  deleteButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  sortLabel: {
    fontWeight: "600",
    opacity: 0.8,
  },
  sortOptions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  sortOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
