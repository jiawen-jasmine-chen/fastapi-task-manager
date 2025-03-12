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
import { fetchTodoLists, createTodoList, joinTodoList, getListUsers } from '../api/todoService';
import homeStyles from '../styles/homeStyles';
import listStyles from '../styles/listStyles';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { RootStackParamList } from '../types/types';
import { Ionicons } from '@expo/vector-icons'; // 确保已安装 react-native-vector-icons

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
  
  // New state for shared users modal
  const [sharedUsersModalVisible, setSharedUsersModalVisible] = useState(false);
  const [selectedListForUsers, setSelectedListForUsers] = useState<number | null>(null);
  const [sharedUsers, setSharedUsers] = useState<{ id: number; username: string; role: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

// Fetch todo lists
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

          // ✅ Load tasks for each list
          lists.forEach((list) => {
            loadTasksForList(list.id);
          });
        }
      } catch (error) {
        console.error('Error fetching ToDo lists:', error);
      }
    };
    
    loadTodoLists();
  }
}, [userId]);

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

  // Render a todo list
  const renderTodoList = ({ item: list }: { item: { id: number; name: string; share: boolean; owner_id?: number } }) => {
    const isShared = list.share;
    const isExpanded = expandedLists[list.id] || false; // 获取当前列表是否展开
    const isOwner = list.owner_id === userId;
    
    return (
      <View style={[listStyles.listContainer, isShared && listStyles.sharedList]}>
        {/* 标题栏 */}
        <View style={listStyles.listHeader}>
          <Text style={listStyles.listTitle}>{list.name}</Text>
          
          {/* Only show share icon for shared lists */}
          {isShared && (
            <TouchableOpacity 
              onPress={() => loadSharedUsers(list.id)}
              style={listStyles.shareIconContainer}
            >
              <Ionicons name="people" size={20} color="grey" style={listStyles.shareIcon} />
            </TouchableOpacity>
          )}
          
          {/* 右侧展开/收起按钮 */}
          <TouchableOpacity onPress={() => toggleExpand(list.id)}>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="grey" />
          </TouchableOpacity>
        </View>
  
        {/* 任务列表（如果展开才显示） */}
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
      [listId]: !prev[listId] // 切换展开/收起状态
    }));
  };

  // Join a shared list
  const handleSubmit = async () => {
    try {
      await joinTodoList(userId, inviteCode);
      Alert.alert("Success", "Joined shared list successfully");
      
      // Refresh lists after joining
      const lists = await fetchTodoLists(userId);
      setTodoLists(lists);
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