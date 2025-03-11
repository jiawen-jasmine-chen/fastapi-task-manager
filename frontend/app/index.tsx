import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router"; // ✅ 仅使用 Expo Router

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // const timeout = setTimeout(() => {
    //   // ✅ 3秒后自动跳转到注册页
    //   router.replace("/RegisterScreen");
    // }, 3000);

    return () => clearTimeout(timeout); // ✅ 组件卸载时清除定时器，防止内存泄漏
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ToDo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
