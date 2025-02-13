import axios from 'axios';

export interface Task {
  id: number;  // ✅ 确保 id 是 number
  text: string;
  completed: boolean;
}

// 后端返回的新任务数据结构
interface CreatedTaskResponse {
  TaskID: number;  // ✅ 这里 TaskID 也是 number
  Description: string;
  Progress: string;
}

// 用于向后端添加新任务的参数结构
interface NewTaskPayload {
  description: string;
  assignee: number;
  due_date: string;
  todolist_id: number;
  owner_id: number;
}

export const addTaskToServer = async (payload: NewTaskPayload): Promise<Task | null> => {
  try {
    const response = await axios.post('http://backend.155.4.244.194.nip.io/tasks', payload);
    const createdTask: CreatedTaskResponse = response.data.task; // ✅ 明确类型

    // ✅ 直接返回 number 类型的 id
    return {
      id: createdTask.TaskID, // ✅ 这里不用转换成 string
      text: createdTask.Description,
      completed: createdTask.Progress !== 'Not Started',
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
