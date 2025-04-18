import axios from 'axios';

const API_BASE_URL = 'http://backend.155.4.244.194.nip.io';

// **获取用户的 ToDoList**
// export const fetchTodoLists = async (userId: number) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/todolists/${userId}`);
//     return response.data.todolists || [];
//   } catch (error:any) {
//     if(error.response.status === 404) {
//       return [];
//     }
//     else{
//       console.error('Error fetching ToDo lists:', error);
//       return [];
//     }
//   }
// };
export const fetchTodoLists = async (userId: number): Promise<{ id: number; name: string; share: boolean; owner_id?: number }[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/todolists/${userId}`);

    console.log("Fetched ToDo Lists:", response.data.todolists);

    return (response.data.todolists || []).map((list: { id: number; name: string; shared: boolean; owner_id: number }) => ({
      id: list.id,
      name: list.name,
      share: list.shared ?? false,
      owner_id: list.owner_id  // Add this line to include owner_id
    }));
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    } else {
      console.error('Error fetching ToDo lists:', error);
      return [];
    }
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

  export const createTodoList = async (userId: number, shared: number, name: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/todolists`, null, {
        params: {
          user_id: userId,
          shared: shared,
          name: name,
        },
      });
  
      return response.data;
    } catch (error: any) {
      console.error('Error creating ToDoList:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create ToDoList');
    }
  };
  
  // 输入邀请码进入share list
export const joinTodoList = async (
  userId: number | null,
  inviteCode: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/todolists/join`,
      null,  // 不需要请求体
      {
        params: {
          user_id: userId,
          invite_code: inviteCode
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // 处理后端返回的明确错误
      const status = error.response.status;
      const message = error.response.data.detail || error.response.data.message;

      if (status === 404) {
        throw new Error("invalid invite code");
      } else if (status === 500) {
        throw new Error("service error, try again");
      }
      throw new Error(message || "failed to join a list");
    } else if (error.request) {
      // 请求已发出但没有收到响应
      throw new Error("unable to connect with the server");
    } else {
      // 其他错误
      throw new Error("other errors");
    }
  }
};

export const getListUsers = async (todolistId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todolists/${todolistId}/users`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch list users: ${response.status}`);
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching list users:', error);
    throw error;
  }
};

export const deleteTodoList = async (todolistId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todolists/${todolistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete todolist: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting todolist:', error);
    return false;
  }
};

// As named, leaves shard list but only for members
export const leaveSharedList = async (todolistId: number, userId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todolists/${todolistId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server responded with error:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Leave shared list error:', error);
    throw error;
  }
};