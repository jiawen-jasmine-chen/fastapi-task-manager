import { Calendar, LocaleConfig } from 'react-native-calendars';
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
//Route
import { useRouter } from 'expo-router'; //
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
//CSS
import homeStyles from '../styles/homeStyles';
//todo
import { fetchTodoLists } from '../api/todoService';
import { Checkbox } from 'expo-checkbox';
//api
import { Task, fetchTasks, addTaskToServer } from '../api/taskService';

export default function CalendarScreen() {
    //Route
    const router = useRouter();
    const userId = useSelector((state: RootState) => state.user.userId);
    const username = useSelector((state: RootState) => state.user.username);
    //todo
      const [todoLists, setTodoLists] = useState<{ id: number; name: string }[]>([]);
      const [selectedTodoList, setSelectedTodoList] = useState<number | null>(null);
      const [tasks, setTasks] = useState<Task[]>([]);
      const [newTask, setNewTask] = useState('');
      const bottomOffset = useRef(new Animated.Value(70)).current;
      const flatListRef = useRef<FlatList>(null);
      //calendar
      const [selectedDate, setSelectedDate] = useState("");
      const filteredTodos = tasks.filter(task => task.due_date === selectedDate);

    // **获取用户的 ToDoLists**
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
              }
            } catch (error) {
              console.error('Error fetching ToDo lists:', error);
            }
          };
          loadTodoLists();
        }
      }, [userId]);
    
      // **获取选定 ToDoList 的任务**
      useEffect(() => {
        if (selectedTodoList) {
          const loadTasks = async () => {
            try {
              const fetchedTasks = await fetchTasks(selectedTodoList);
              console.log('Fetched tasks from backend:', fetchedTasks);
              setTasks(fetchedTasks);
            } catch (error) {
              console.error('Error fetching tasks:', error);
            }
          };
          loadTasks();
        }
      }, [selectedTodoList]);

        // **任务完成状态切换**
        const toggleTaskCompletion = (id: number) => {
            setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
            );
        };

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
              console.log('Navigating with task:', taskWithDefaults);
              router.push({
                pathname: '/TaskDetailScreen',
                params: { task: JSON.stringify(taskWithDefaults) },
              });
            }}
          >
            {/* ✅ 添加 Checkbox 和 Text 组件 */}
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
      };


    return(
        <SafeAreaView style = {homeStyles.container}>
            <Calendar
                onDayPress={(day : { dateString: string }) => setSelectedDate(day.dateString)} // 
                markedDates={{
                    [selectedDate]: { selected: true, selectedColor: "#3498db" }, // highlight
                  }}
            />

            {/* 选中日期显示 */}
            <Text style={homeStyles.selectedDateText}>
                {selectedDate ? `Tasks for ${selectedDate}` : "Select a date"}
            </Text>

            {/* 任务列表 */}
          {tasks.length === 0 ? (
            <View style={homeStyles.emptyState}>
              <Text style={homeStyles.emptyStateText}>No tasks found! 🎉</Text>
              <Text style={homeStyles.emptySubText}>Try adding a new task below.</Text>
            </View>
          ) : (
            <FlatList 
              ref={flatListRef}
              //data={tasks}
              data={filteredTodos}
              keyExtractor={(item, index) => (item.id ? item.id.toString() : `temp-${index}`)}
              renderItem={renderTask}
              initialNumToRender={10}
              removeClippedSubviews={true}
              contentContainerStyle={homeStyles.taskList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
    );
};