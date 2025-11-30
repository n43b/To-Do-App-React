import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TaskListScreen from "@/screens/TaskListScreen";
import AddTaskScreen from "@/screens/AddTaskScreen";
import EditTaskScreen from "@/screens/EditTaskScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type TasksStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  EditTask: {
    taskId: string;
    currentTitle: string;
    currentCategoryId?: string;
    currentDueDate?: number;
  };
};

const Stack = createNativeStackNavigator<TasksStackParamList>();

export default function TasksStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Meine Aufgaben" />,
        }}
      />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          headerTitle: "Neue Aufgabe",
          presentation: "modal",
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
        }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{
          headerTitle: "Aufgabe bearbeiten",
          presentation: "modal",
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
        }}
      />
    </Stack.Navigator>
  );
}
