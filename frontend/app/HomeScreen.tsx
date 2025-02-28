import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Animated,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { fetchTodoLists } from '../api/todoService';
import { Task, fetchTasks, addTaskToServer, updateTaskOnServer } from '../api/taskService'; // ✅ 确保引入 updateTaskOnServer
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import homeStyles from '../styles/homeStyles';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.userId);
  const username = useSelector((state: RootState) => state.user.username);

  const [todoLists, setTodoLists] = useState<{ id: number; name: string }[]>([]);
  const [selectedTodoList, setSelectedTodoList] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const bottomOffset = useRef(new Animated.Value(70)).current;

  const flatListRef = useRef<FlatList>(null);

  // **获取用户的 ToDoLists**
  useEffect(() => {
    if (userId) {
      const loadTodoLists = async () => {
        try {
          const lists = await fetchTodoLists(userId);
          console.log('Fetched TodoLists:', lists);

          setTodoLists(lists);
          if (lists.length > 0) {
            setSelectedTodoList(lists[0].id);
            console.log('Selected ToDoList:', lists[0].id);
          }
        } catch (error) {
          console.error('Error fetching ToDo lists:', error);
        }
      };
      loadTodoLists();
    }
  }, [userId]);

  // **获取选定 ToDoList 的任务**
  useEffect(() => {
    if (selectedTodoList) {
      const loadTasks = async () => {
        try {
          const fetchedTasks = await fetchTasks(selectedTodoList);
          console.log('Fetched tasks from backend:', fetchedTasks);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };
      loadTasks();
    }
  }, [selectedTodoList]);

  // **键盘弹起时调整输入框位置**
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(bottomOffset, {
        toValue: e.endCoordinates.height - 20,
        duration: 30,
        useNativeDriver: false,
      }).start();
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(bottomOffset, {
        toValue: 70,
        duration: 150,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // **任务完成状态切换**
  const toggleTaskCompletion = async (id: number) => {
    // 找到当前任务
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // 计算新的 progress 状态
    const newProgress = task.progress === 'Completed' ? 'Uncompleted' : 'Completed';

    try {
      // ✅ 调用后端 API 更新任务状态
      const updatedTask = await updateTaskOnServer(id, { progress: newProgress });

      if (updatedTask) {
        // ✅ 更新本地任务状态
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, progress: newProgress, completed: newProgress === 'Completed' } : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
      alert('Failed to update task status.');
    }
  };

  // **添加任务**
  const addTask = async () => {
    if (newTask.trim().length === 0) {
      alert('Task cannot be empty!');
      return;
    }
    if (newTask.length > 50) {
      alert('Task text is too long. Keep it under 50 characters.');
      return;
    }
    if (!selectedTodoList || !userId) {
      alert('Missing ToDoList ID or User ID.');
      return;
    }

    const newTaskPayload = {
      description: newTask.trim(),
      assignee: userId,
      due_date: new Date().toISOString().split('T')[0],
      todolist_id: selectedTodoList,
      owner_id: userId,
      progress: "Uncompleted", // ✅ 添加默认 progress 值
    };
    

    console.log('Payload being sent:', newTaskPayload);
    try {
      const addedTask = await addTaskToServer(newTaskPayload);
      if (addedTask) {
        const updatedTasks = await fetchTasks(selectedTodoList);
        setTasks(updatedTasks);
        setNewTask('');
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        alert('Failed to add task.');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('An error occurred while adding the task.');
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    return (
      <TouchableOpacity
        style={homeStyles.taskRow}
        onPress={() => {
          console.log('Navigating with task:', item);
          router.push({
            pathname: '/TaskDetailScreen',
            params: { task: JSON.stringify(item) },
          });
        }}
      >
        {/* ✅ 确保 Checkbox 调用后端更新任务 */}
        <Checkbox
          value={item.completed}
          onValueChange={() => toggleTaskCompletion(item.id)}
          style={homeStyles.checkbox}
        />
        <Text style={[homeStyles.taskText, item.completed && homeStyles.completedTask]}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={homeStyles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={homeStyles.innerContainer}>
          {/* 标题 */}
          <View style={homeStyles.header}>
            <View style={homeStyles.titleContainer}>
              <Text style={homeStyles.headerText}>Welcome, {username}!</Text>
            </View>
          </View>

          {/* 任务列表 */}
          {tasks.length === 0 ? (
            <View style={homeStyles.emptyState}>
              <Text style={homeStyles.emptyStateText}>No tasks found! 🎉</Text>
              <Text style={homeStyles.emptySubText}>Try adding a new task below.</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={tasks}
              keyExtractor={(item, index) => (item.id ? item.id.toString() : `temp-${index}`)}
              renderItem={renderTask}
              initialNumToRender={10}
              removeClippedSubviews={true}
              contentContainerStyle={homeStyles.taskList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* 输入框 */}
          <Animated.View style={[homeStyles.inputWrapper, { bottom: bottomOffset }]}>
            <View style={homeStyles.whiteBackgroundBar} />
            <View style={homeStyles.inputContainer}>
              <TextInput
                style={homeStyles.input}
                placeholder="Write a task..."
                value={newTask}
                onChangeText={setNewTask}
                onSubmitEditing={addTask}
              />
              <TouchableOpacity style={homeStyles.addButton} onPress={addTask}>
                <Text style={homeStyles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
