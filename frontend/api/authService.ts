import axios from 'axios';

const API_BASE_URL = 'http://backend.155.4.244.194.nip.io';

// 用户注册
export const registerUser = async (username: string): Promise<{ success: boolean; user_id?: number; message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, null, {
      params: { username }
    });

    return response.data; // 直接返回 `{ success, user_id, message }`
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, message: "An error occurred, please try again." };
  }
};

// 用户登录
export const loginUser = async (username: string): Promise<{ success: boolean; user_id?: number; message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, null, {
      params: { username }
    });

    return response.data; // 返回 `{ success, user_id, message }`
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, message: "An error occurred, please try again." };
  }
};

// 获取用户信息
export const getUserDetails = async (user_id: number): Promise<{ user_id: number; username: string } | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${user_id}`);

    if (response.data.exists) {
      return { user_id: response.data.user_id, username: response.data.username };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};
