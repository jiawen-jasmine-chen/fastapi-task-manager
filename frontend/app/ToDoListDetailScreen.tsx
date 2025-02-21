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
import { Checkbox } from 'expo-checkbox';
import { fetchTasks, addTaskToServer } from '../api/taskService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import homeStyles from '../styles/homeStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ToDoListDetailScreen() {
  const router = useRouter();
  const { listId, listName } = useLocalSearchParams<{ listId: string; listName: string }>();
  const userId = useSelector((state: RootState) => state.user.userId);

  const [selectedTodoList, setSelectedTodoList] = useState<number | null>(null);
  const [tasks, setTasks] = useState<{ id: number; description: string; completed: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');
  const bottomOffset = useRef(new Animated.Value(70)).current;
  const flatListRef = useRef<FlatList>(null);

  // ✅ Set selectedTodoList from route params
  useEffect(() => {
    if (listId) {
      setSelectedTodoList(Number(listId));
    }
  }, [listId]);

  // ✅ Fetch tasks when selectedTodoList is set
  useEffect(() => {
    if (selectedTodoList) {
      const loadTasks = async () => {
        try {
          const fetchedTasks = await fetchTasks(selectedTodoList);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };
      loadTasks();
    }
  }, [selectedTodoList]);

  // ✅ Keyboard Handling
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

  // ✅ Toggle Task Completion
  const toggleTaskCompletion = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // ✅ Add Task
  const addTask = async () => {
    if (newTask.trim().length === 0) {
      alert('Task cannot be empty!');
      return;
    }
    if (newTask.length > 50) {
      alert('Task text is too long. Keep it under 50 characters.');
      return;
    }
    if (selectedTodoList == null || userId == null) {
      alert('Missing ToDoList ID or User ID.');
      return;
    }

    const newTaskPayload = {
      description: newTask.trim(),
      assignee: userId,
      due_date: new Date().toISOString().split('T')[0],
      todolist_id: selectedTodoList,
      owner_id: userId,
    };

    console.log('Payload being sent:', newTaskPayload);
    try {
      const addedTask = await addTaskToServer(newTaskPayload);

      if (addedTask) {
        // ✅ Refetch tasks to update UI immediately after adding
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

  // ✅ Render Task Item
  const renderTask = ({ item }: { item: { id: number; description: string; completed: boolean } }) => (
    <TouchableOpacity
      style={homeStyles.taskRow}
      onPress={() => {
        console.log('Navigating to TaskDetailScreen with task:', item);
        router.push({
          pathname: '/TaskDetailScreen',
          params: { task: JSON.stringify(item) },
        });
      }}
    >
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
  

  return (
    <SafeAreaView style={homeStyles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={homeStyles.innerContainer}>
          {/* ✅ Title */}
          <Text style={homeStyles.headerText}>{listName || 'ToDo List'}</Text>

          {/* ✅ Tasks List */}
          {tasks.length === 0 ? (
            <View style={homeStyles.emptyState}>
              <Text style={homeStyles.emptyStateText}>No tasks found! 🎉</Text>
              <Text style={homeStyles.emptySubText}>Try adding a new task below.</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={tasks}
              keyExtractor={(item, index) => (item.id ? item.id.toString() : `task-${index}`)}
              renderItem={renderTask}
              contentContainerStyle={homeStyles.taskList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* ✅ New Task Input */}
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

          {/* ✅ Go Back */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: 'blue' }}>⬅ Go Back</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
