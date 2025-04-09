import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  reminderTime?: Date;
}

const TaskManagerScreen = () => {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("You need to enable notifications in settings.");
      }
    };
    requestPermissions();
  }, []);

  // Function to add a new task with reminder
  const addTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert("Error", "Please enter a task title.");
      return;
    }
  
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle,
      isCompleted: false,
      reminderTime: new Date(Date.now() + 60 * 1000), // Reminder after 1 minute
    };
  
    setTasks([...tasks, newTask]);
    setTaskTitle("");
  
    // Calculate the trigger time (1 minute later)
    const triggerTime = new Date();
    triggerTime.setMinutes(triggerTime.getMinutes() + 1);
  
    // Schedule notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `Reminder for task: ${taskTitle}`,
      },
      trigger: { date: triggerTime }, // Trigger at a specific date-time (1 minute later)
    });
  
    Alert.alert("Task Added", "Reminder set successfully for 1 minute later.");
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Manager</Text>

      <TextInput
        value={taskTitle}
        onChangeText={setTaskTitle}
        placeholder="Enter task..."
        style={styles.input}
      />
      <Button title="Add Task" onPress={addTask} />

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10,
  },
  taskText: {
    fontSize: 18,
  },
});

export default TaskManagerScreen;
