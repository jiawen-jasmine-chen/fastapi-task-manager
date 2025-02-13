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
import { fetchTasks, addTaskToServer, Task } from '../api/taskService';
import axios, { AxiosError } from 'axios';


export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [bottomOffset] = useState(new Animated.Value(70));
  const flatListRef = useRef<FlatList>(null);

  // 使用 useEffect 动态获取任务数据
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    loadTasks();
  }, []);
  
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

  const toggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addTask = async () => {
    if (newTask.trim().length === 0) {
      alert('Task cannot be empty!');
      return;
    }
    if (newTask.length > 50) {
      alert('Task text is too long. Keep it under 50 characters.');
      return;
    }
  
    const newTaskPayload = {
      description: newTask.trim(),  // 确保是非空字符串
      assignee: 1,                  // 确保是有效用户 ID
      due_date: new Date().toISOString().split('T')[0],  // 格式为 YYYY-MM-DD
      todolist_id: 1,
      owner_id: 1,
    };
  
    // 打印请求参数，查看所有字段是否正确
    console.log('Payload being sent:', newTaskPayload);
  
    try {
      const addedTask = await addTaskToServer(newTaskPayload);
      if (addedTask) {
        setTasks((prevTasks) => [...prevTasks, addedTask]);
        setNewTask('');
      } else {
        alert('Failed to add task.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Backend error response:', error.response?.data);
      } else {
        console.error('Unknown error:', error);
      }
      alert('An error occurred while adding the task.');
    }
  };
  

  const renderTask = ({ item }: { item: Task }) => (
    <View>
      <View style={styles.taskRow}>
        <Checkbox
          value={item.completed}
          onValueChange={() => toggleTaskCompletion(item.id)}
          style={styles.checkbox}
        />
        <Text style={[styles.taskText, item.completed && styles.completedTask]}>{item.text}</Text>
      </View>
      <View style={styles.separator} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* 标题部分 */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerText}>Today</Text>
              <Text style={styles.headerSubText}>26 Dec</Text>
            </View>
          </View>

          {/* 空状态或者任务列表部分 */}
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks yet. 🎉</Text>
              <Text style={styles.emptySubText}>Enjoy your day or add a new task below!</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={tasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id.toString()}  // 确保 id 是唯一的字符串
              initialNumToRender={10}
              removeClippedSubviews={true}
              contentContainerStyle={styles.taskList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* 输入框和加号按钮 */}
          <Animated.View style={[styles.inputWrapper, { bottom: bottomOffset }]}>
            <View style={styles.whiteBackgroundBar} />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Write a task..."
                value={newTask}
                onChangeText={setNewTask}
                onSubmitEditing={addTask}
              />
              <TouchableOpacity style={styles.addButton} onPress={addTask}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: 8,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerSubText: {
    fontSize: 20,
    color: '#808080',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    marginRight: 10,
  },
  taskText: {
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#dcdcdc',
    marginVertical: 5,
  },
  inputWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#ffffff',
  },
  whiteBackgroundBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: '#ffffff',
    zIndex: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: -5,
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#6c63ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
  },
});
