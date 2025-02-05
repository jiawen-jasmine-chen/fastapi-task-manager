import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TaskItemProps {
  category: string;
  tasks: string[];
}

const TaskItem: React.FC<TaskItemProps> = ({ category, tasks }) => {
  return (
    <View style={styles.container}>
      <View style={styles.categoryLabel}>
        <Text style={styles.categoryText}>{category.toUpperCase()}</Text>
      </View>
      <View>
      {tasks.map((task, index) => (
        <View key={index} style={styles.taskContainer}>
          <View style={styles.task}>
            <View style={styles.checkbox} />
            <View style={styles.taskTextContainer}>
              <Text>{task}</Text>
            </View>
          </View>
        </View>
      ))}
      </View>

    </View>
  );
};

export default TaskItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 16,//
    marginTop: 8,//
  },
  categoryLabel: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    marginVertical: 10,
    marginBottom: 16,//
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#10B981",
    backgroundColor: "white",
    zIndex: 1,
    position: "relative",
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
  },
  task: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    marginRight: 16,
  },
  taskTextContainer: {
    flex: 1,
  },
});
