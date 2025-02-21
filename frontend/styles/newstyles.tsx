import { StyleSheet } from 'react-native';

const newstyles = StyleSheet.create({
  createListContainerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#dcdcdc',
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
  listButton: {
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  listButtonText: {
    fontSize: 18,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
    fontSize: 16,
  },
});

export default newstyles;
