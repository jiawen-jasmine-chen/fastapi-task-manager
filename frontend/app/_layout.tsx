import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store'; // 确保路径正确
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme(); // 获取当前的系统主题（浅色/深色模式）

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="ToDoListDetailScreen" options={{ title: 'ToDo List Details' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
