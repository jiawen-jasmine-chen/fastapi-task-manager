import { StyleSheet } from 'react-native';

// ✅ **样式**
const taskDetailStyles  = StyleSheet.create({
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
    input: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 20,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#6c63ff',
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
    // New styles for delete button
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center', // Centers the buttons
      alignItems: 'center',
      gap: 90, // Adds slight spacing between buttons
      
    },
    deleteButton: {
      backgroundColor: '#FF3B30', // Red color for delete button
      borderRadius: 25,
      paddingVertical: 14,
      paddingHorizontal: 30,
      alignSelf: 'center',
      marginTop: 30,
      shadowColor: '#FF3B30',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    deleteButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
  
  export default taskDetailStyles;