import { StyleSheet } from 'react-native';

const ToDoListStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  // ✅ ToDoList Creation Styles
  createListContainer: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#6c63ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },

  // ✅ ToDoList Display Styles
  listButton: {
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  listButtonText: {
    fontSize: 18,
  },

  // ✅ 🟡 Empty State Text for FlatList
  emptyStateText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default ToDoListStyles;
