import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const TaskDetailScreen = () => {
  const params = useLocalSearchParams();
  
  // 处理参数为空的情况
  if (!params.task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ 任务数据丢失，请返回首页</Text>
      </View>
    );
  }

  // 反序列化任务数据
  const task = JSON.parse(params.task as string);

  // 跳转到编辑页（需实现编辑页路由）
  const handleEdit = () => {
    console.log('Navigate to edit screen:', task.id);
    // router.push({ pathname: '/EditTaskScreen', params: { task: JSON.stringify(task) } });
  };

  return (
    <View style={styles.container}>
      {/* 标题式描述 */}
      <Text style={styles.title}>{task.description}</Text>

      {/* 详细信息卡片 */}
      <View style={styles.card}>

        {/* 进度 */}
        <View style={styles.row}>
          <Text style={styles.label}>Progress:</Text>
          <Text style={styles.value}>{task.progress || 'unassigned'}</Text>
        </View>

        {/* 负责人 */}
        <View style={styles.row}>
          <Text style={styles.label}>Assignee:</Text>
          <Text style={styles.value}>{task.assignee || 'unassigned'}</Text>
        </View>

        {/* 截止日期 */}
        <View style={styles.row}>
          <Text style={styles.label}>DDL:</Text>
          <Text style={[styles.value, task.due_date ? styles.normal : styles.muted]}>
            {task.due_date || 'None'}
          </Text>
        </View>

        {/* 完成状态 */}
        <View style={[styles.row, styles.statusRow]}>
          <Text style={styles.label}>Completed:</Text>
          <Text style={task.completed ? styles.completed : styles.incomplete}>
            {task.completed ? '✅ Completed' : '❌ Incompleted'}
          </Text>
        </View>
      </View>

      {/* 编辑按钮 */}
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Edit Task</Text>
      </TouchableOpacity>
    </View>
  );
};

// 样式定义（与 homeStyles 保持一致性）
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statusRow: {
    borderBottomWidth: 0, // 最后一行不需要分隔线
  },
  label: {
    fontSize: 16,
    color: '#6c757d',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#212529',
    flex: 2,
    textAlign: 'right',
  },
  muted: {
    color: '#6c757d',
  },
  normal: {
    color: '#212529',
  },
  completed: {
    color: '#28a745',
    fontWeight: '600',
  },
  incomplete: {
    color: '#dc3545',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginTop: 30,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TaskDetailScreen;