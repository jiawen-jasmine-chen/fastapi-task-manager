import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchUsers } from '../api/authService';
import { updateTaskOnServer, deleteTaskFromServer } from '../api/taskService';
import taskDetailStyles from '../styles/TaskDetailStyles';

const TaskDetailScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<{
    id: number;
    description: string;
    assignee?: number;
    owner_id?: number;
    due_date?: string;
    created_at?: string;
    completed: boolean;
    todolist_id: number;
  } | null>(null);
  
  const [users, setUsers] = useState<Record<number, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    if (!params.task) return;
    const parsedTask = JSON.parse(params.task as string);
    setTask(parsedTask);
    setEditedDescription(parsedTask.description);

    fetchUsers().then((userList) => {
      const userMap: Record<number, string> = {};
      userList.forEach((user) => {
        userMap[user.UserID] = user.Username;
      });
      setUsers(userMap);
    });
  }, [params.task]);

  if (!task) {
    return (
      <View style={taskDetailStyles.errorContainer}>
        <Text style={taskDetailStyles.errorText}>⚠️ 任务数据丢失，请返回首页</Text>
      </View>
    );
  }

  const todolistId = task.todolist_id ? `List ${task.todolist_id}` : 'None';
  const assigneeName = task.assignee ? users[task.assignee] || `User ${task.assignee}` : 'Unassigned';
  const ownerName = task.owner_id ? users[task.owner_id] || `User ${task.owner_id}` : 'Unknown';

  // ✅ 只显示 `YYYY-MM-DD` 格式的日期
  const formattedCreatedAt = task.created_at ? task.created_at.split('T')[0] : 'Unknown';
  const formattedDueDate = task.due_date ? task.due_date.split('T')[0] : 'None';

  // ✅ 修改任务描述
  const handleSave = async () => {
    if (!editedDescription.trim()) {
      alert("Description cannot be empty!");
      return;
    }

    try {
      const updatedTask = await updateTaskOnServer(task.id, { description: editedDescription });
      if (updatedTask) {
        setTask((prev) => prev ? { ...prev, description: editedDescription } : null);
        setIsEditing(false);
      } else {
        alert("Failed to update task.");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("An error occurred while updating the task.");
    }
  };

  // ✅ 切换任务完成状态
  const toggleCompletion = async () => {
    const newCompleted = !task.completed;
    try {
      const updatedTask = await updateTaskOnServer(task.id, { progress: newCompleted ? "Completed" : "Uncompleted" });
      if (updatedTask) {
        setTask((prev) => prev ? { ...prev, completed: newCompleted } : null);
      }
    } catch (error) {
      console.error("Error updating task progress:", error);
      alert("An error occurred while updating the task.");
    }
  };

  // ✅ 删除任务
  const handleDeleteTask = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteTaskFromServer(task.id);
              if (success) {
                alert("Task deleted successfully!");
                router.back();
              } else {
                alert("Failed to delete task.");
              }
            } catch (error) {
              console.error("Error deleting task:", error);
              alert("An error occurred while deleting the task.");
            }
          }
        }
      ]
    );
  };

  const handleBack = async () => {
    if (isEditing && editedDescription !== task.description) {
      await handleSave();
    }
    router.back();
  };

  return (
    <View style={taskDetailStyles.container}>
      {isEditing ? (
        <TextInput
          style={taskDetailStyles.input}
          value={editedDescription}
          onChangeText={setEditedDescription}
          autoFocus
          onBlur={handleSave}
          onSubmitEditing={handleSave}
        />
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={taskDetailStyles.title}>{task.description}</Text>
        </TouchableOpacity>
      )}

      <View style={taskDetailStyles.card}>
        {/* ✅ ToDoListID */}
          <View style={taskDetailStyles.row}>
          <Text style={taskDetailStyles.label}>List ID:</Text>
          <Text style={taskDetailStyles.value}>{todolistId}</Text>
        </View>

        {/* ✅ Assignee */}
        <View style={taskDetailStyles.row}>
          <Text style={taskDetailStyles.label}>Assignee:</Text>
          <Text style={taskDetailStyles.value}>{assigneeName}</Text>
        </View>

        {/* ✅ Created By */}
        <View style={taskDetailStyles.row}>
          <Text style={taskDetailStyles.label}>Created By:</Text>
          <Text style={taskDetailStyles.value}>{ownerName}</Text>
        </View>

        {/* ✅ Created At */}
        <View style={taskDetailStyles.row}>
          <Text style={taskDetailStyles.label}>Created At:</Text>
          <Text style={taskDetailStyles.value}>{formattedCreatedAt}</Text>
        </View>

        {/* ✅ DDL（任务截止日期） */}
        <View style={taskDetailStyles.row}>
          <Text style={taskDetailStyles.label}>DDL:</Text>
          <Text style={taskDetailStyles.value}>{formattedDueDate}</Text>
        </View>

        {/* ✅ Completed (点击修改状态) */}
        <View style={[taskDetailStyles.row, taskDetailStyles.statusRow]}>
          <Text style={taskDetailStyles.label}>Completed:</Text>
          <TouchableOpacity onPress={toggleCompletion}>
            <Text style={task.completed ? taskDetailStyles.completed : taskDetailStyles.incomplete}>
              {task.completed ? '✅ Completed' : '❌ Incompleted'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Buttons container with Back and Delete buttons */}
      <View style={taskDetailStyles.buttonContainer}>
        <TouchableOpacity style={taskDetailStyles.editButton} onPress={handleBack}>
          <Text style={taskDetailStyles.editButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={taskDetailStyles.deleteButton} onPress={handleDeleteTask}>
          <Text style={taskDetailStyles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskDetailScreen;