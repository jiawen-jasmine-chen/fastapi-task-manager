import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { fetchTodoLists, createTodoList } from '../api/todoService';
import { Task, fetchTasks, addTaskToServer, updateTaskOnServer } from '../api/taskService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import homeStyles from '../styles/homeStyles';
import newstyles from '../styles/newstyles';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.userId);
  const username = useSelector((state: RootState) => state.user.username);

  const [todoLists, setTodoLists] = useState<{ id: number; name: string }[]>([]);
  const [selectedTodoList, setSelectedTodoList] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isShared, setIsShared] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // **Fetch user ToDoLists**
  useEffect(() => {
    if (userId) {
      const loadTodoLists = async () => {
        try {
          const lists = await fetchTodoLists(userId);
          console.log('Fetched TodoLists:', lists);
          setTodoLists(lists);
          if (lists.length > 0) {
            setSelectedTodoList(lists[0].id);
          }
        } catch (error) {
          console.error('Error fetching ToDo lists:', error);
        }
      };
      loadTodoLists();
    }
  }, [userId]);

  // ✅ Refresh tasks when returning to Home
  useFocusEffect(
    useCallback(() => {
      if (selectedTodoList) {
        const loadTasks = async () => {
          try {
            const fetchedTasks = await fetchTasks(selectedTodoList);
            console.log('🔄 Tasks updated after returning:', fetchedTasks);
            setTasks(fetchedTasks);
          } catch (error) {
            console.error('Error fetching tasks:', error);
          }
        };
        loadTasks();
      }
    }, [selectedTodoList])
  );

  // **Task Completion Toggle**
  const toggleTaskCompletion = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newProgress = task.progress === 'Completed' ? 'Uncompleted' : 'Completed';

    try {
      const updatedTask = await updateTaskOnServer(id, { progress: newProgress });
      if (updatedTask) {
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

  // **Add New Task**
  const addTask = async () => {
    if (newTask.trim().length === 0) {
      alert('Task cannot be empty!');
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
      progress: "Uncompleted",
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

  // **Create a New ToDoList**
  const handleCreateTodoList = async () => {
    if (newListName.trim() === '') {
      Alert.alert('List name cannot be empty!');
      return;
    }
    if (!userId) {
      Alert.alert('User ID not found!');
      return;
    }

    try {
      const sharedFlag = isShared ? 1 : 0;
      const newList = await createTodoList(userId, sharedFlag, newListName);
      
      if (!newList || !newList.todolist_id) {
        throw new Error('Failed to retrieve new list ID.');
      }

      setTodoLists((prev) => [...prev, { id: newList.todolist_id, name: newListName }]);
      setNewListName('');
      setIsShared(false);

      let message = `List "${newListName}" has been created successfully!`;

      if (sharedFlag === 1 && newList.inviteCode) {
        message += `\n\n🎉 Share this invite code with others to join:\n${newList.inviteCode}`;
      }
  
      Alert.alert('ToDoList Created', message, [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error creating ToDoList:', error);
      Alert.alert('An error occurred while creating the ToDoList.');
    }
  };

  return (
    <SafeAreaView style={homeStyles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={homeStyles.innerContainer}>
            {/* Header */}
            <Text style={homeStyles.headerText}>Welcome, {username}!</Text>

            {/* ToDoList Display */}
            <FlatList
              data={todoLists}
              keyExtractor={(item, index) => `${item?.id ?? 'key'}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={newstyles.listButton}
                  onPress={() => setSelectedTodoList(item.id)}
                >
                  <Text style={newstyles.listButtonText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={newstyles.emptyStateText}>No ToDoLists yet. Create one!</Text>}
            />

            {/* ToDoList Creation */}
            <View style={newstyles.createListContainerBottom}>
              <TextInput
                style={newstyles.input}
                placeholder="Enter ToDoList Name"
                value={newListName}
                onChangeText={setNewListName}
              />

              <View style={newstyles.checkboxContainer}>
                <Checkbox value={isShared} onValueChange={setIsShared} style={newstyles.checkbox} />
                <Text style={newstyles.checkboxLabel}>Shared List</Text>
              </View>

              <TouchableOpacity style={newstyles.createButton} onPress={handleCreateTodoList}>
                <Text style={newstyles.createButtonText}>Create ToDoList</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
