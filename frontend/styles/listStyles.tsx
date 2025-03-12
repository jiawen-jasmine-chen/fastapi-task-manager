import { StyleSheet } from 'react-native';

const listStyles = StyleSheet.create({
  mainContainer: {
    padding: 16,
  },
  listContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sharedList: {
    borderLeftWidth: 5,
    borderLeftColor: '#6c63ff',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  iconButton: {
    padding: 5,
    marginLeft: 2,
  },
  shareIcon: {
    marginRight: 8,
  },
  shareIconContainer: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  joinContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  joinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
  
  // Shared Users Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userIcon: {
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  ownerRole: {
    color: '#6c63ff',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Action Menu Styles
  actionModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtons: {
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  deleteText: {
    color: '#FF3B30',
  },
});

export default listStyles;