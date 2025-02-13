import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // ⏳ 3秒后自动跳转到注册页面
    const timeout = setTimeout(() => {
      router.replace('/RegisterScreen');
    }, 3000);

    return () => clearTimeout(timeout); // 清除定时器，防止内存泄漏
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ToDo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  title: { fontSize: 48, fontWeight: 'bold', color: '#fff' }, // ✅ 白色大号文本
});
