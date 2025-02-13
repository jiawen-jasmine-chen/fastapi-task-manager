import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { fetchTodoLists, fetchTasks } from '../api/todoService';
import { Task, addTaskToServer } from '../api/taskService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import homeStyles from '../styles/homeStyles';

export default function HomeScreen() {
  const userId = useSelector((state: RootState) => state.user.userId);
  const username = useSelector((state: RootState) => state.user.username);
  const [todoLists, setTodoLists] = useState<{ id: number; name: string }[]>([]);
  const [selectedTodoList, setSelectedTodoList] = useState<number | null>(null);
  const [newTask, setNewTask] = useState('');
  const [bottomOffset] = useState(new Animated.Value(70));
  const flatListRef = useRef<FlatList>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  

  // **获取用户的 ToDoLists**
  useEffect(() => {
    if (userId) {
      const loadTodoLists = async () => {
        try {
          const lists = await fetchTodoLists(userId);
          console.log('Fetched TodoLists:', lists); // ✅ 检查数据

          setTodoLists(lists);
          if (lists.length > 0) {

            console.log('Selected ToDoList:', lists[0].id); // ✅ 确保 `id` 正确
            setSelectedTodoList(lists[0].id); // 默认选第一个
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
          console.log("Fetched tasks:", fetchedTasks); // ✅ 确保 id 存在
          setTasks(fetchedTasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };
      loadTasks();
    }
  }, [selectedTodoList]);

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
  const toggleTaskCompletion = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
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
      assignee: userId, // 确保 userId 是 number
      due_date: new Date().toISOString().split('T')[0],
      todolist_id: selectedTodoList, // 选中的 ToDoList
      owner_id: userId,
    };

    console.log('Payload being sent:', newTaskPayload);

    try {
      const addedTask = await addTaskToServer(newTaskPayload);
      if (addedTask) {
        setTasks((prevTasks) => [...prevTasks, addedTask]); // ✅ 确保 Task 结构一致
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

  // **渲染任务**
  const renderTask = ({ item }: { item: Task }) => (
    <View>
      <View style={homeStyles.taskRow}>
        <Checkbox
          value={item.completed}
          onValueChange={() => toggleTaskCompletion(item.id)}
          style={homeStyles.checkbox}
        />
        <Text style={[homeStyles.taskText, item.completed && homeStyles.completedTask]}>
          {item.text} {/* ✅ 确保 `text` 而不是 `description` */}
        </Text>
      </View>
      <View style={homeStyles.separator} />
    </View>
  );

  return (
    <SafeAreaView style={homeStyles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={homeStyles.innerContainer}>
          <View style={homeStyles.header}>
            <View style={homeStyles.titleContainer}>
              <Text style={homeStyles.headerText}>Welcome, {username}!</Text>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}            initialNumToRender={10}
            removeClippedSubviews={true}
            contentContainerStyle={homeStyles.taskList}
            showsVerticalScrollIndicator={false}
          />

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
