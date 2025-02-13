import axios from 'axios';

const API_BASE_URL = 'http://backend.155.4.244.194.nip.io';

export const registerUser = async (username: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, null, {
      params: { username }
    });

    if (response.data.status === "error") {
      return { success: false, message: "Username already exists" };
    }

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, message: "An error occurred, please try again." };
  }
};
