// TaskManagerScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
}

const TaskManagerScreen = () => {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // Function to add a new task
  const addTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert("Error", "Please enter a task title.");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle,
      isCompleted: false,
    };

    setTasks([...tasks, newTask]);
    setTaskTitle(""); // Clear input field
  };

  // Function to toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  // Function to delete a task
  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Manager</Text>

      {/* Input field to add new tasks */}
      <TextInput
        value={taskTitle}
        onChangeText={setTaskTitle}
        placeholder="Enter task..."
        style={styles.input}
      />
      <Button title="Add Task" onPress={addTask} />

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity
              style={[styles.task, item.isCompleted && styles.completedTask]}
              onPress={() => toggleTaskCompletion(item.id)}
            >
              <Text style={styles.taskText}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  task: {
    flex: 1,
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  taskText: {
    fontSize: 18,
  },
  deleteButton: {
    color: "red",
    fontWeight: "bold",
  },
});

export default TaskManagerScreen;
