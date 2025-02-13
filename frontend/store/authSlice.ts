import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userId: number | null;  // ✅ 让 userId 存 `number`
  username: string | null;
}

const initialState: UserState = {
  userId: null,
  username: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ userId: number; username: string }>) => {  // ✅ userId 必须是 number
      state.userId = action.payload.userId;
      state.username = action.payload.username;
    },
    logout: (state) => {
      state.userId = null;
      state.username = null;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
