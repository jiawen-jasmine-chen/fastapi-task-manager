import axios from 'axios';

const API_BASE_URL = 'http://backend.155.4.244.194.nip.io';

// **获取用户的 ToDoList**
export const fetchTodoLists = async (userId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/todolists/${userId}`);
    return response.data.todolists;
  } catch (error) {
    console.error('Error fetching ToDo lists:', error);
    return [];
  }
};

// **获取 ToDoList 里的任务**
export const fetchTasks = async (todolistId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${todolistId}`);
      console.log("Fetched tasks from backend:", response.data.tasks); // ✅ 检查数据
      return response.data.tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  };
