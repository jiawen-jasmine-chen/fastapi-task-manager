import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store"; // ✅ 确保路径正确
import { useColorScheme } from "react-native";
import { Tabs, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "./LoginScreen"; // ✅ 引入登录页
import { RootState } from "@/store/store";

function AppTabs() {
  const userId = useSelector((state: RootState) => state.user?.userId) as number | null; // ✅ 确保 userId 正确

  if (!userId) {
    return <LoginScreen />; // ✅ 如果未登录，显示登录界面
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "HomeScreen") {
            iconName = "home-outline";
          } else if (route.name === "CalendarScreen") {
            iconName = "calendar-outline";
          }
          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3498db",
        tabBarInactiveTintColor: "gray",
      })}
    >
      {/* ✅ 只在底部导航栏显示 Home 和 Calendar */}
      <Tabs.Screen name="HomeScreen" options={{ title: "Home" }} />
      <Tabs.Screen name="CalendarScreen" options={{ title: "Calendar" }} />

      {/* ❌ 隐藏非底部导航的页面 */}
      <Tabs.Screen name="ToDoListDetailScreen" options={{ href: null }} />
      <Tabs.Screen name="TaskDetailScreen" options={{ href: null }} />
      <Tabs.Screen name="LoginScreen" options={{ href: null }} />
      <Tabs.Screen name="RegisterScreen" options={{ href: null }} />
      <Tabs.Screen name="ListScreen" options={{ href: null }} />
      <Tabs.Screen name="(tabs)" options={{ href: null }} />
      <Tabs.Screen name="+not-found" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme(); // ✅ 自动检测深色/浅色模式

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}> {/* ✅ 这里才是 Redux 初始化 */}
        <AppTabs />
      </PersistGate>
    </Provider>
  );
}
