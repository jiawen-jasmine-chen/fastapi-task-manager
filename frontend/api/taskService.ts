import axios from 'axios';

const API_BASE_URL = 'http://backend.155.4.244.194.nip.io';

export interface Task {
  id: number;
  description: string;
  progress: string;
  assignee?: number;
  due_date?: string;
  created_at?: string;
  todolist_id?: number;
  owner_id?: number;
  completed: boolean; // ✅ 由 `progress` 计算
}

interface RawTask {
  id: number;
  description: string;
  progress: string;
  assignee?: number;
  due_date?: string;
  created_at?: string;
  todolist_id?: number;
  owner_id?: number;
}

export const fetchTasks = async (todolistId: number): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/${todolistId}`);
    const fetchedTasks: RawTask[] = response.data.tasks;

    console.log("Fetched tasks from backend:", fetchedTasks);

    return fetchedTasks.map((task) => ({
      ...task,
      completed: task.progress === 'Completed', // ✅ 修正 completed 逻辑
      todolist_id: task.todolist_id,
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const addTaskToServer = async (payload: Omit<Task, 'id' | 'completed'>): Promise<Task | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks`, payload);
    const createdTask: RawTask = response.data.task;

    return {
      ...createdTask,
      completed: createdTask.progress === 'Completed', // ✅ 确保 completed 计算正确
    };
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
};

// ✅ 新增 updateTaskOnServer 方法
export const updateTaskOnServer = async (taskId: number, updates: Partial<Task>): Promise<Task | null> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updates);
    const updatedTask: RawTask = response.data.task;

    return {
      ...updatedTask,
      completed: updatedTask.progress === 'Completed', // ✅ 确保 completed 计算正确
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};
