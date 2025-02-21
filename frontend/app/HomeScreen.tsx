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
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { fetchTodoLists, createTodoList } from '../api/todoService';
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
  
      
  
      setTodoLists((prev) => [...prev, { id: newList.id, name: newListName }]);
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
  

  const handleListPress = (listId: number, listName: string) => {

    router.push({
      pathname: '../ToDoListDetailScreen',
      params: { listId: listId.toString(), listName: listName }
    });
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

            {/* 🟡 ToDoList Display */}
            <FlatList
              data={todoLists}
              keyExtractor={(item, index) => `${item?.id ?? 'key'}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={newstyles.listButton}
                  onPress={() => handleListPress(item.id, item.name)}
                >
                  <Text style={newstyles.listButtonText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={newstyles.emptyStateText}>No ToDoLists yet. Create one!</Text>}
              contentContainerStyle={{ paddingBottom: 150 }} // ⬅️ Space for bottom input
            />

            {/* 🟢 ToDoList Creation at Bottom */}
            <View style={newstyles.createListContainerBottom}>
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
