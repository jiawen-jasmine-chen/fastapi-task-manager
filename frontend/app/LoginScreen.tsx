import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { loginUser } from '../api/authService'; // 调用登录 API
import { setUser } from '../store/authSlice';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async () => {
    if (username.trim().length === 0) {
      alert('Please enter a username!');
      return;
    }

    try {
      const response = await loginUser(username);

      if (!response.success) {
        alert(response.message);
        return;
      }

      // ✅ 确保 userId 存的是 number
      const userIdNumber = Number(response.user_id);
      if (isNaN(userIdNumber)) {
        alert('Invalid user ID received.');
        return;
      }

      // 存储用户信息到 Redux
      dispatch(setUser({ userId: userIdNumber, username: username }));

      // 弹窗显示 "Hello, 用户名"
      Alert.alert('Login Successful', `Hello, ${username}!`, [
        { text: 'OK', onPress: () => router.replace('/HomeScreen') }
      ]);
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
    }
  };

  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 15, color: '#000' },
  button: { backgroundColor: '#000', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 18 },
});
