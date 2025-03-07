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
  Button
} from 'react-native';
import { useRouter } from 'expo-router';
import { Checkbox } from 'expo-checkbox';
import { fetchTodoLists, createTodoList, joinTodoList } from '../api/todoService';
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
  const [todoLists, setTodoLists] = useState<{ id: number; name: string; share: boolean }[]>([]);
  const [selectedTodoList, setSelectedTodoList] = useState<number | null>(null);
  const [tasksByList, setTasksByList] = useState<{ [key: number]: Task[] }>({});
  //
  const [newListName, setNewListName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [expandedLists, setExpandedLists] = useState<{ [key: number]: boolean }>({});
  const [inviteCode, setInviteCode] = useState("");


// 修改 useEffect 部分
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

          // ✅ 确保任务被正确加载
          lists.forEach((list : any)=> {
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

  // 获取单个列表的任务
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

  // 渲染单个任务（复用 HomeScreen 的样式）
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

  const renderTodoList = ({ item: list }: { item: { id: number; name: string; share: boolean } }) => {
    const isShared = list.share;
    const isExpanded = expandedLists[list.id] || false; // 获取当前列表是否展开
    
    return (
      <View style={[listStyles.listContainer, isShared && listStyles.sharedList]}>
        {/* 标题栏 */}
        <View style={listStyles.listHeader}>
          <Text style={listStyles.listTitle}>{list.name}</Text>
          {isShared && <Ionicons name="share-social" size={20} color="grey" style={listStyles.shareIcon} />}
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
  
        setTodoLists((prev) => [...prev, { id: newList.todolist_id, name: newListName, share:isShared }]);
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

    //任务列表展开
    const toggleExpand = (listId: number) => {
      setExpandedLists(prev => ({
        ...prev,
        [listId]: !prev[listId] // 切换展开/收起状态
      }));
    };

    //加入share list
    const handleSubmit = async () => {
      try {
        await joinTodoList(userId, inviteCode);
        Alert.alert("成功", "已加入共享列表");
        // 可以导航到列表页面或刷新列表
      } catch (error) {
        // 错误已经在 service 中处理，这里可选是否要额外处理
      }
    };
    
  
  return (
    <SafeAreaView style={homeStyles.container}>
      <View>

        {/* join a list */}
        <View style={listStyles.joinContainer}>
          <View>
            <TextInput
              style={listStyles.joinInput}
              value={inviteCode}
              onChangeText={setInviteCode} // 更新状态
            />
          </View>  
          <Button title="join a list" onPress={handleSubmit}/>
      </View>

        {/* lists */}
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
