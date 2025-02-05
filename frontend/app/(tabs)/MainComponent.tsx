import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import TaskItem from "@/components/TaskItem";
import AddTaskForm from "@/components/AddTaskForm";

function MainComponent() {
  const personalTasks = [
    "Create icons for a dashboard",
    "Prepare a design presentation",
  ];
  const sharedTasks = [
    "Stretch for 15 minutes",
    "Plan your meal",
    "Review daily goals before sleeping. Add some new if time permits",
  ];
  const otherTasks = ["Water indoor plants"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Today</Text>
      </View>
        <TaskItem category="PERSONAL" tasks={personalTasks} />
        <TaskItem category="SHARED" tasks={sharedTasks} />
        <TaskItem category="OTHERS" tasks={otherTasks} />
        <AddTaskForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
    backgroundColor: "#FFF",
    maxWidth: 480,
    alignSelf: "center",
  },
  header: {
    flexDirection: "column",
    width: "100%",
  },
  headerText: {
    paddingHorizontal: 16,
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
});

export default MainComponent;
