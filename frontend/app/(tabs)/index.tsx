import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    fetch('http://backend.155.4.244.194.nip.io/taskstest') // 这里替换成你的后端 API 地址
      .then(response => response.json()) 
      .then(data => setTasks(data)) 
      .catch(error => console.error('Error fetching tasks:', error));
  }, []); // 空依赖数组，确保仅在组件挂载时请求数据

  return (
    <View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ padding: 10 }}>{item.text}</Text>
        )}
      />
    </View>
  );


// export default function HomeScreen() {
//   const [tasks, setTasks] = useState<Task[]>([
//     { id: '1', text: 'Drink 8 glasses of water', completed: false },
//     { id: '2', text: 'Edit the PDF', completed: false },
//     { id: '3', text: 'Write in a gratitude journal', completed: false },
//     { id: '4', text: 'Stretch everyday for 15 mins', completed: false },
//   ]);

  const [newTask, setNewTask] = useState('');
  const [bottomOffset] = useState(new Animated.Value(70));
  const flatListRef = useRef<FlatList>(null);

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

  const addTask = () => {
    if (newTask.trim().length === 0) {
      alert('Task cannot be empty!');
      return;
    }
    if (newTask.length > 50) {
      alert('Task text is too long. Keep it under 50 characters.');
      return;
    }

    if (newTask.trim()) {
      const updatedTasks = [...tasks, { id: `${tasks.length + 1}`, text: newTask, completed: false }];
      setTasks(updatedTasks);
      setNewTask('');

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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

          {/* 空状态或者列表部分 */}
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
              keyExtractor={(item) => item.id}
              initialNumToRender={10}
              removeClippedSubviews={true}
              contentContainerStyle={styles.taskList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* 包裹输入框和背景条的容器 */}
          <Animated.View style={[styles.inputWrapper, { bottom: bottomOffset }]}>
            <View style={styles.whiteBackgroundBar} />

            {/* 输入框和加号按钮 */}
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
