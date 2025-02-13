import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  userId: string | null;
}

const initialState: UserState = {
  userId: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    logout: (state) => {
      state.userId = null;
    },
  },
});

export const { setUserId, logout } = userSlice.actions;
export default userSlice.reducer;
