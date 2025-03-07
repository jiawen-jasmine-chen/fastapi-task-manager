import { StyleSheet } from 'react-native';

const listStyles = StyleSheet.create({
    listContainer: {
      padding: 15,
      margin: 10,
      borderRadius: 8,
      backgroundColor: '#f8f9fa', // 默认背景色
      flexDirection: 'row',
      alignItems: 'center',
    },
    sharedList: {
      backgroundColor: '#E6E6FA', // 共享列表的特殊背景色
    },
    shareIcon: {
      marginLeft: 10,
    },
    mainContainer: {
      paddingHorizontal: 20,
    },
    listTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 10,
      paddingLeft: 10,
    },
    emptyText: {
      color: '#999',
      textAlign: 'center',
      paddingVertical: 20,
    },
  });

  export default listStyles;