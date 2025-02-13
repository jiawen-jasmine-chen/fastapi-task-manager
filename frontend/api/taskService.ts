import axios from 'axios';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface RawTask {
  tasks: [number, string, number][];
}

// 后端返回的新任务数据结构
interface CreatedTaskResponse {
  id: number;
  description: string;
  completed: number;
}

// 用于向后端添加新任务的参数结构
interface NewTaskPayload {
  description: string;
  assignee: number;
  due_date: string;
  todolist_id: number;
  owner_id: number;
}

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await axios.get<RawTask>('http://backend.155.4.244.194.nip.io/taskstest');
    const transformedTasks: Task[] = response.data.tasks.map((taskArray) => ({
      id: taskArray[0].toString(),
      text: taskArray[1],
      completed: taskArray[2] === 1,
    }));
    return transformedTasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const addTaskToServer = async (payload: NewTaskPayload): Promise<Task | null> => {
  try {
    const response = await axios.post('http://backend.155.4.244.194.nip.io/tasks', payload);
    const createdTask = response.data.task;

    // 确保使用后端返回的 TaskID 作为前端的 id
    return {
      id: createdTask.TaskID.toString(),  // 将 TaskID 映射到 id
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