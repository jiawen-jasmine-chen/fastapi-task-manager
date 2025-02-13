import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../../api/authService'; // 调用后端 API

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (username.trim().length === 0) {
      alert('Please enter a username!');
      return;
    }

    try {
      const response = await registerUser(username); // 调用注册 API

      if (!response.success) {
        alert(response.message); // 用户名已存在或注册失败
        return;
      }

      alert(`Registered successfully as: ${username}`);
      router.push('/screens/LoginScreen'); // 注册成功后跳转到登录页面
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/screens/LoginScreen')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
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
  loginText: { marginTop: 15, color: '#000', fontSize: 16, textDecorationLine: 'underline' }
});
