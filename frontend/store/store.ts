import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@react-native-async-storage/async-storage';
import userReducer from './authSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // ✅ 只持久化 `user`
  serialize: true, // ✅ 确保 Redux 只存 JSON 可序列化数据
};

const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ 关闭 `non-serializable value` 检查
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
