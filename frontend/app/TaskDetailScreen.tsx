import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchUsers } from '../api/authService';
import { updateTaskOnServer } from '../api/taskService';
import taskDetailStyles from '../styles/TaskDetailStyles';  // ✅ 引入样式

const TaskDetailScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  // ✅ 任务数据
  const [task, setTask] = useState<{ 
    id: number; 
    description: string; 
    assignee?: number; 
    owner_id?: number; 
    due_date?: string; 
    completed: boolean 
  } | null>(null);

  // ✅ 所有用户数据（用于映射 `assignee` 和 `owner`）
  const [users, setUsers] = useState<Record<number, string>>({});
  const [assigneeName, setAssigneeName] = useState('Unassigned');
  const [ownerName, setOwnerName] = useState('Unknown');

  // ✅ 编辑模式
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    if (!params.task) return;

    // 🔹 解析任务数据
    const parsedTask = JSON.parse(params.task as string);
    setTask(parsedTask);
    setEditedDescription(parsedTask.description);

    // 🔹 获取用户数据
    fetchUsers().then((userList) => {
      console.log("🔍 Received Users:", userList);
      const userMap: Record<number, string> = {};
      userList.forEach((user) => {
        console.log(`🆔 Mapping UserID ${user.UserID} -> ${user.Username}`); // ✅ 确保 user.UserID 存在
        userMap[user.UserID] = user.Username;
      });
      setUsers(userMap);
    });
  }, [params.task]);

  // 🔹 监听 `users` 变化，更新 `assigneeName` 和 `ownerName`
  useEffect(() => {
    if (task && users) {
      setAssigneeName(task.assignee ? users[task.assignee] || `User ${task.assignee}` : 'Unassigned');
      setOwnerName(task.owner_id ? users[task.owner_id] || `User ${task.owner_id}` : 'Unknown');
    }
  }, [users, task]);

  if (!task) {
    return (
      <View style={taskDetailStyles.errorContainer}>
        <Text style={taskDetailStyles.errorText}>⚠️ 任务数据丢失，请返回首页</Text>
      </View>
    );
  }

  console.log("📌 Task:", task);
  console.log("👤 Assignee Name:", assigneeName);
  console.log("👤 Owner Name:", ownerName);
  console.log("📄 Users Map:", users);

  // 🔹 **修改任务描述**
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

  // 🔹 **返回时自动保存**
  const handleBack = async () => {
    if (isEditing && editedDescription !== task.description) {
      await handleSave();
    }
    router.back();
  };

  return (
    <View style={taskDetailStyles.container}>
      {/* 🔹 **任务描述（可编辑）** */}
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

      {/* 🔹 **详细信息卡片** */}
      <View style={taskDetailStyles.card}>
        {/* 🔹 **负责人** */}
        <View style={taskDetailStyles.row}>
          <Text style={taskDetailStyles.label}>Assignee:</Text>
          <Text style={taskDetailStyles.value}>{assigneeName}</Text>
        </View>

        {/* 🔹 **创建人** */}
        <View style={taskDetailStyles.row}>
          <Text style={taskDetailStyles.label}>Created By:</Text>
          <Text style={taskDetailStyles.value}>{ownerName}</Text>
        </View>

        {/* 🔹 **创建日期** */}
        <View style={taskDetailStyles.row}>
          <Text style={taskDetailStyles.label}>Created At:</Text>
          <Text style={taskDetailStyles.value}>{task.due_date || 'Unknown'}</Text>
        </View>

        {/* 🔹 **完成状态** */}
        <View style={[taskDetailStyles.row, taskDetailStyles.statusRow]}>
          <Text style={taskDetailStyles.label}>Completed:</Text>
          <Text style={task.completed ? taskDetailStyles.completed : taskDetailStyles.incomplete}>
            {task.completed ? '✅ Completed' : '❌ Incompleted'}
          </Text>
        </View>
      </View>

      {/* 🔹 **返回按钮** */}
      <TouchableOpacity style={taskDetailStyles.editButton} onPress={handleBack}>
        <Text style={taskDetailStyles.editButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TaskDetailScreen;
