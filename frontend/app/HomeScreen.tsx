import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { fetchTodoLists, createTodoList } from '../api/todoService'; // API Calls
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import homeStyles from '../styles/homeStyles';
import newstyles from '../styles/newstyles';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.userId);
  const username = useSelector((state: RootState) => state.user.username);

  const [todoLists, setTodoLists] = useState<{ id: number; name: string }[]>([]);
  const [newListName, setNewListName] = useState('');
  const [isShared, setIsShared] = useState(false);

  // Fetch user's ToDoLists on load
  useEffect(() => {
    if (userId) {
      const loadTodoLists = async () => {
        try {
          const lists = await fetchTodoLists(userId);
          setTodoLists(lists);
        } catch (error) {
          console.error('Error fetching ToDo lists:', error);
        }
      };
      loadTodoLists();
    }
  }, [userId]);

  // Handle creating a new ToDoList
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
      const newList = await createTodoList(userId, isShared ? 1 : 0, newListName);
      setTodoLists((prev) => [...prev, { id: newList.id, name: newListName }]);
      setNewListName('');
      setIsShared(false);

      Alert.alert('ToDoList Created', `List "${newListName}" has been created successfully!`);
    } catch (error) {
      console.error('Error creating ToDoList:', error);
      Alert.alert('An error occurred while creating the ToDoList.');
    }
  };

  // Navigate to specific ToDoList screen
  const handleListPress = (listId: number) => {
    router.push(`/ToDoListDetailScreen/${listId}`);
  };

  return (
    <SafeAreaView style={homeStyles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={homeStyles.innerContainer}>
          {/* Header */}
          <Text style={homeStyles.headerText}>Welcome, {username}!</Text>

          {/* 🟢 ToDoList Creation */}
          <View style={newstyles.createListContainer}>
            <TextInput
              style={newstyles.input}
              placeholder="Enter ToDoList Name"
              value={newListName}
              onChangeText={setNewListName}
              placeholderTextColor="#888"
            />

            <View style={newstyles.checkboxContainer}>
              <Checkbox
                value={isShared}
                onValueChange={setIsShared}
                style={newstyles.checkbox}
              />
              <Text style={newstyles.checkboxLabel}>Shared List</Text>
            </View>

            <TouchableOpacity style={newstyles.createButton} onPress={handleCreateTodoList}>
              <Text style={newstyles.createButtonText}>Create ToDoList</Text>
            </TouchableOpacity>
          </View>

          {/* 🟡 ToDoList Display */}
          <FlatList
            data={todoLists}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={newstyles.listButton}
                onPress={() => handleListPress(item.id)}
              >
                <Text style={newstyles.listButtonText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={newstyles.emptyStateText}>No ToDoLists yet. Create one!</Text>}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
