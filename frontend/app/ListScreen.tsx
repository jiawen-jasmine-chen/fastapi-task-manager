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
  Platform,
  Button,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Checkbox } from 'expo-checkbox';
import { 
  fetchTodoLists, 
  createTodoList, 
  joinTodoList, 
  getListUsers, 
  deleteTodoList, 
  leaveSharedList 
} from '../api/todoService';
import homeStyles from '../styles/homeStyles';
import listStyles from '../styles/listStyles';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { RootStackParamList } from '../types/types';
import { Ionicons } from '@expo/vector-icons';

import { Task, fetchTasks, addTaskToServer, updateTaskOnServer } from '../api/taskService';
import newstyles from '../styles/newstyles';

export default function ListScreen() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.userId);
  const username = useSelector((state: RootState) => state.user.username);
  const [todoLists, setTodoLists] = useState<{ id: number; name: string; share: boolean; owner_id?: number }[]>([]);
  const [selectedTodoList, setSelectedTodoList] = useState<number | null>(null);
  const [tasksByList, setTasksByList] = useState<{ [key: number]: Task[] }>({});
  const [newListName, setNewListName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [expandedLists, setExpandedLists] = useState<{ [key: number]: boolean }>({});
  const [inviteCode, setInviteCode] = useState("");
  
  // Shared users modal states
  const [sharedUsersModalVisible, setSharedUsersModalVisible] = useState(false);
  const [selectedListForUsers, setSelectedListForUsers] = useState<number | null>(null);
  const [sharedUsers, setSharedUsers] = useState<{ id: number; username: string; role: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // New state for action menu modal
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedListForAction, setSelectedListForAction] = useState<{
    id: number;
    name: string;
    share: boolean;
    owner_id?: number;
  } | null>(null);

  // Fetch todo lists
  useEffect(() => {
    if (userId) {
      loadTodoLists();
    }
  }, [userId]);

  const loadTodoLists = async () => {
    try {
      const lists = await fetchTodoLists(userId);
      console.log('Fetched TodoLists:', lists);

      setTodoLists(lists);

      if (lists.length > 0) {
        setSelectedTodoList(lists[0].id);
        console.log('Selected ToDoList:', lists[0].id);

        // Load tasks for each list
        lists.forEach((list) => {
          loadTasksForList(list.id);
        });
      }
    } catch (error) {
      console.error('Error fetching ToDo lists:', error);
    }
  };

  // Load tasks for a specific list
  const loadTasksForList = async (listId: number) => {
    try {
      const tasks = await fetchTasks(listId);
      setTasksByList(prev => ({
        ...prev,
        [listId]: tasks,
      }));
    } catch (error) {
      console.error(`Error fetching tasks for list ${listId}:`, error);
    }
  };

  // Render a single task
  const renderTask = ({ item }: { item: Task }) => {
    const taskWithDefaults = {
      ...item,
      todolist_id: item.todolist_id ?? -1,
      owner_id: item.owner_id ?? -1,
      completed: item.completed ?? false
    };

    return (
      <TouchableOpacity
        style={homeStyles.taskRow}
        onPress={() => {
          router.push({
            pathname: '/TaskDetailScreen',
            params: { task: JSON.stringify(taskWithDefaults) },
          });
        }}
      >
        <Checkbox
          value={item.completed}
          onValueChange={() => {}}
          style={homeStyles.checkbox}
        />
        <Text style={[homeStyles.taskText, item.completed && homeStyles.completedTask]}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  // Load shared users for a list
  const loadSharedUsers = async (listId: number) => {
    setLoadingUsers(true);
    setSelectedListForUsers(listId);
    
    try {
      const users = await getListUsers(listId);
      setSharedUsers(users);
      setSharedUsersModalVisible(true);
    } catch (error) {
      console.error('Error loading shared users:', error);
      Alert.alert('Error', 'Could not load shared users for this list');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Delete a todo list (for owners)
  const handleDeleteList = async () => {
    if (!selectedListForAction) return;
    
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${selectedListForAction.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteTodoList(selectedListForAction.id);
              if (success) {
                // Remove the list from state
                setTodoLists(prev => prev.filter(list => list.id !== selectedListForAction.id));
                // Close the action menu
                setActionMenuVisible(false);
                setSelectedListForAction(null);
                Alert.alert('Success', 'List deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete list');
              }
            } catch (error) {
              console.error('Error deleting list:', error);
              Alert.alert('Error', 'An error occurred while deleting the list');
            }
          }
        }
      ]
    );
  };

  // Leave a shared list (for members)
  const handleLeaveList = async () => {
    if (!selectedListForAction || !userId) return;
    
    Alert.alert(
      'Leave List',
      `Are you sure you want to leave "${selectedListForAction.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await leaveSharedList(selectedListForAction.id, userId);
              if (success) {
                // Remove the list from state
                setTodoLists(prev => prev.filter(list => list.id !== selectedListForAction.id));
                // Close the action menu
                setActionMenuVisible(false);
                setSelectedListForAction(null);
                Alert.alert('Success', 'You have left the list');
              } else {
                Alert.alert('Error', 'Failed to leave list');
              }
            } catch (error) {
              console.error('Error leaving list:', error);
              Alert.alert('Error', 'An error occurred while leaving the list');
            }
          }
        }
      ]
    );
  };

  // Open action menu for a list
  const openActionMenu = (list: { id: number; name: string; share: boolean; owner_id?: number }) => {
    setSelectedListForAction(list);
    setActionMenuVisible(true);
  };

  // Render a todo list
  const renderTodoList = ({ item: list }: { item: { id: number; name: string; share: boolean; owner_id?: number } }) => {
    const isShared = list.share;
    const isExpanded = expandedLists[list.id] || false;
    const isOwner = list.owner_id === userId;
    
    return (
      <View style={[listStyles.listContainer, isShared && listStyles.sharedList]}>
        {/* List Header */}
        <View style={listStyles.listHeader}>
          <Text style={listStyles.listTitle}>{list.name}</Text>
          
          <View style={listStyles.headerActions}>
            {/* Shared Users Button (only for shared lists) */}
            {isShared && (
              <TouchableOpacity 
                onPress={() => loadSharedUsers(list.id)}
                style={listStyles.iconButton}
              >
                <Ionicons name="people" size={22} color="grey" />
              </TouchableOpacity>
            )}
            
            {/* More Actions Button */}
            <TouchableOpacity 
              onPress={() => openActionMenu(list)}
              style={listStyles.iconButton}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="grey" />
            </TouchableOpacity>
            
            {/* Expand/Collapse Button */}
            <TouchableOpacity 
              onPress={() => toggleExpand(list.id)}
              style={listStyles.iconButton}
            >
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={22} color="grey" />
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Task List (shown when expanded) */}
        {isExpanded && (
          <FlatList
            data={tasksByList[list.id] || []}
            keyExtractor={(task) => task.id.toString()}
            renderItem={renderTask}
            contentContainerStyle={homeStyles.taskList}
            ListEmptyComponent={<Text style={listStyles.emptyText}>No ToDos</Text>}
          />
        )}
      </View>
    );
  };

  // Create a new todo list
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
  
      setTodoLists((prev) => [...prev, { 
        id: newList.todolist_id, 
        name: newListName, 
        share: isShared,
        owner_id: userId 
      }]);
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

  // Toggle expand/collapse for list
  const toggleExpand = (listId: number) => {
    setExpandedLists(prev => ({
      ...prev,
      [listId]: !prev[listId]
    }));
  };

  // Join a shared list
  const handleSubmit = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    
    try {
      await joinTodoList(userId, inviteCode);
      Alert.alert("Success", "Joined shared list successfully");
      
      // Refresh lists after joining
      loadTodoLists();
      setInviteCode("");
    } catch (error) {
      console.error('Error joining list:', error);
      Alert.alert("Error", "Failed to join list. Please check the invite code.");
    }
  };
    
  return (
    <SafeAreaView style={homeStyles.container}>
      <View style={{ flex: 1 }}>
        {/* Join a list section */}
        <View style={listStyles.joinContainer}>
          <TextInput
            style={listStyles.joinInput}
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="Enter invite code"
          />
          <Button title="Join a List" onPress={handleSubmit} />
        </View>

        {/* Lists */}
        <FlatList 
          data={todoLists}
          keyExtractor={(list) => list.id.toString()}
          renderItem={renderTodoList}
          contentContainerStyle={listStyles.mainContainer}
          ListEmptyComponent={
            <View style={homeStyles.emptyState}>
              <Text style={homeStyles.emptyStateText}>No Lists</Text>
            </View>
          }
        />

        {/* Shared Users Modal */}
        <Modal
          visible={sharedUsersModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSharedUsersModalVisible(false)}
        >
          <View style={listStyles.modalOverlay}>
            <View style={listStyles.modalContainer}>
              <Text style={listStyles.modalTitle}>Shared Users</Text>
              
              {loadingUsers ? (
                <ActivityIndicator size="large" color="#6c63ff" />
              ) : (
                <FlatList
                  data={sharedUsers}
                  keyExtractor={(user) => user.id.toString()}
                  renderItem={({ item }) => (
                    <View style={listStyles.userItem}>
                      <Ionicons 
                        name={item.role === 'owner' ? 'person-circle' : 'person'} 
                        size={24} 
                        color={item.role === 'owner' ? '#6c63ff' : 'gray'} 
                        style={listStyles.userIcon}
                      />
                      <View style={listStyles.userInfo}>
                        <Text style={listStyles.userName}>{item.username}</Text>
                        <Text style={[
                          listStyles.userRole, 
                          item.role === 'owner' && listStyles.ownerRole
                        ]}>
                          {item.role === 'owner' ? 'Owner' : 'Member'}
                        </Text>
                      </View>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text style={listStyles.emptyText}>No shared users found</Text>
                  }
                />
              )}
              
              <TouchableOpacity 
                style={listStyles.closeButton}
                onPress={() => setSharedUsersModalVisible(false)}
              >
                <Text style={listStyles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* List Actions Modal */}
        <Modal
          visible={actionMenuVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActionMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setActionMenuVisible(false)}>
            <View style={listStyles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={listStyles.actionModalContainer}>
                  <Text style={listStyles.modalTitle}>
                    {selectedListForAction?.name}
                  </Text>
                  
                  <View style={listStyles.actionButtons}>
                    {/* Always show delete option for owner */}
                    {selectedListForAction?.owner_id === userId && (
                      <TouchableOpacity 
                        style={listStyles.actionButton}
                        onPress={handleDeleteList}
                      >
                        <Ionicons name="trash" size={24} color="#FF3B30" />
                        <Text style={[listStyles.actionText, listStyles.deleteText]}>
                          Delete List
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {/* If not owner, show leave option */}
                    {selectedListForAction?.owner_id !== userId && (
                      <TouchableOpacity 
                        style={listStyles.actionButton}
                        onPress={handleLeaveList}
                      >
                        <Ionicons name="exit" size={24} color="#FF9500" />
                        <Text style={listStyles.actionText}>
                          Leave List
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {/* Cancel button */}
                    <TouchableOpacity 
                      style={listStyles.actionButton}
                      onPress={() => setActionMenuVisible(false)}
                    >
                      <Ionicons name="close-circle" size={24} color="#8E8E93" />
                      <Text style={listStyles.actionText}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

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
    </SafeAreaView>
  );
}