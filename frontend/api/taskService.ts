import axios from 'axios';

const API_BASE_URL = 'http://backend.155.4.244.194.nip.io';

// ✅ 确保 `Task` 结构和后端一致
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

// 后端返回的任务数据格式
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

// 新建任务的请求格式
interface NewTaskPayload {
  description: string;
  assignee: number;
  due_date: string;
  todolist_id: number;
  owner_id: number;
}

// ✅ 获取任务列表，确保转换数据格式
export const fetchTasks = async (todolistId: number): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/${todolistId}`);
    const fetchedTasks: RawTask[] = response.data.tasks;

    console.log("Fetched tasks from backend:", fetchedTasks);

    return fetchedTasks.map((task) => ({
      id: task.id,
      description: task.description, // ✅ 确保 `description` 解析正确
      progress: task.progress,
      assignee: task.assignee,
      due_date: task.due_date,
      created_at: task.created_at,
      todolist_id: task.todolist_id,
      owner_id: task.owner_id,
      completed: task.progress !== 'Not Started', // ✅ `progress` 不是 "Not Started" 就标记为已完成
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

// ✅ 添加新任务，确保 id 为 number
export const addTaskToServer = async (payload: NewTaskPayload): Promise<Task | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks`, payload);
    const createdTask: RawTask = response.data.task; // ✅ 明确类型

    console.log("New task added:", createdTask);

    return {
      id: createdTask.id, // ✅ 确保 `id` 为 number
      description: createdTask.description,
      progress: createdTask.progress,
      assignee: createdTask.assignee,
      due_date: createdTask.due_date,
      created_at: createdTask.created_at,
      todolist_id: createdTask.todolist_id,
      owner_id: createdTask.owner_id,
      completed: createdTask.progress !== 'Not Started', // ✅ 由 `progress` 确定完成状态
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Backend error response:', error.response?.data);
    } else {
      console.error('Unknown error:', error);
    }
    return null;
  }
};
