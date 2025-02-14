import { StyleSheet } from 'react-native';

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    marginRight: 10,
  },
  taskText: {
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#dcdcdc',
    marginVertical: 5,
  },
  inputWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#ffffff',
  },
  whiteBackgroundBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: '#ffffff',
    zIndex: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: -5,
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#6c63ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
  },
  listButton: {
    backgroundColor: '#6c63ff',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  listButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
  },
  listcontainer: {
    paddingTop: 15,
    paddingBottom: 5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default homeStyles;
