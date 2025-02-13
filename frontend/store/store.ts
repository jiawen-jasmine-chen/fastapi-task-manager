import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from './authSlice'; // 确保路径正确

// 配置 Redux 持久化
const persistConfig = {
  key: 'root', // 存储的 key
  storage: AsyncStorage, // 使用 React Native 的 AsyncStorage
};

// 创建持久化 reducer
const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer, // 让 Redux 记住 userId
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 关闭序列化检查，防止 AsyncStorage 报错
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
