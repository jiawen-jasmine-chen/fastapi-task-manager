import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Checkbox } from 'expo-checkbox';
import { fetchTodoLists, fetchTasks } from '../api/todoService';
import { Task } from '../api/taskService';
import homeStyles from '../styles/homeStyles';
import listStyles from '../styles/listStyles';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { RootStackParamList } from '../types/types';
import { Ionicons } from '@expo/vector-icons'; // 确保已安装 react-native-vector-icons

export default function ListScreen() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.userId);
  const username = useSelector((state: RootState) => state.user.username);
  const [todoLists, setTodoLists] = useState<{ id: number; name: string; share: boolean }[]>([]);
  const [selectedTodoList, setSelectedTodoList] = useState<number | null>(null);
  const [tasksByList, setTasksByList] = useState<{ [key: number]: Task[] }>({});

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
    
    return (
      <View style={[listStyles.listContainer, isShared && listStyles.sharedList]}>
      {/* 列表标题 */}
      <Text style={listStyles.listTitle}>
        {list.name}
      </Text>
      {isShared && <Ionicons name="share-social" size={20} color="white" style={listStyles.shareIcon} />}

      {/* 任务列表 */}
      <FlatList
        data={tasksByList[list.id] || []}
        keyExtractor={(task) => task.id.toString()}
        renderItem={renderTask}
        contentContainerStyle={homeStyles.taskList}
        ListEmptyComponent={
          <Text style={listStyles.emptyText}>No ToDos</Text>
        }
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={homeStyles.container}>
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
    </SafeAreaView>
  );
}

  // // 渲染单个任务列表（包含标题和任务）
  // const renderTodoList = ({ item: list }: { item: { id: number; name: string } }) => (
  //   <View style={listStyles.listContainer}>
  //     {/* 列表标题 */}
  //     <Text style={listStyles.listTitle}>{list.name}</Text>
      
  //     {/* 任务列表 */}
  //     <FlatList
  //       data={tasksByList[list.id] || []}
  //       keyExtractor={(task) => task.id.toString()}
  //       renderItem={renderTask}
  //       contentContainerStyle={homeStyles.taskList}
  //       ListEmptyComponent={
  //         <Text style={listStyles.emptyText}>No ToDos</Text>
  //       }
  //     />
  //   </View>
  // );
