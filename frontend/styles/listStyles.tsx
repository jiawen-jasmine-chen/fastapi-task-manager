import { StyleSheet } from 'react-native';

const listStyles = StyleSheet.create({
    // listContainer: {
    //   padding: 15,
    //   margin: 10,
    //   borderRadius: 8,
    //   backgroundColor: '#f8f9fa', // 默认背景色
    //   flexDirection: 'row',
    //   alignItems: 'center',
    // },
    sharedList: {
      backgroundColor: '#E6E6FA', // 共享列表的特殊背景色
    },
    shareIcon: {
      marginLeft: 5,
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
    // listHeader: {
    //   flexDirection: "row",
    //   justifyContent: "space-between",
    //   alignItems: "center",
    // },
    listContainer: {
      marginVertical: 10,
      padding: 10,
      backgroundColor: "#f8f9fa",
      borderRadius: 10,
    },
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between", // 标题和按钮分开
      alignItems: "center",
      paddingBottom: 5, // 确保列表与标题有间距
    },
    joinContainer: {
      padding: 20,
    },
    joinLabel: {
      fontSize: 16,
      marginBottom: 10,
    },
    joinInput: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
  });

  export default listStyles;