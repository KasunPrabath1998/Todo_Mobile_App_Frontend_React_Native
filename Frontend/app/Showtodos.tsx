import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter , useNavigation} from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Todo {
  id: string; // Updated to string to match common ID formats in APIs
  title: string;
  description: string;
}

const TodoScreen = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();


      // Hide the header for this screen
      const navigation = useNavigation();
      React.useLayoutEffect(() => {
        navigation.setOptions({
          headerShown: false,
        });
      }, [navigation]);


  const fetchTodos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert('Error', 'No authentication details found. Please log in.');
        return;
      }

      const response = await axios.get(`http://10.0.2.2:3001/api/todos/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        // Assuming response.data is an array of todos
        const todosFromApi = response.data.map((todo: any) => ({
          id: todo._id, // Map _id to id if needed
          title: todo.title,
          description: todo.description,
        }));
        setTodos(todosFromApi);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // If the error is a 404, assume no todos are available
        setTodos([]);
      } else {
        console.error('Error fetching todos:', error);
        setError('An error occurred while fetching todos.');
        Alert.alert('Error', 'An error occurred while fetching todos.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodos();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handlePress = async (todo: Todo) => {
    try {
      router.push({
        pathname: './Task Details',
        params: { todoId: todo.id },  // Pass only the todoId
      });
    } catch (error) {
      console.error('Error navigating to todo details:', error);
    }
  };

  const renderTodoItem = ({ item }: { item: Todo }) => {
    console.log('Rendering item with ID:', item.id); // Debugging log
    return (
      <TouchableOpacity onPress={() => handlePress(item)} style={styles.todoItem}>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.todoDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
     
      <View style={styles.content}>
       
        <Text style={styles.title}>Your Todos</Text>
        {todos.length > 0 ? (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id} // Ensure unique key for each item
            renderItem={renderTodoItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        ) : (
          <View style={styles.noTodosContainer}>
            <Text style={styles.noTodos}>No tasks available.</Text>
            <TouchableOpacity onPress={() => router.push('./Addtodolist')} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add a Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center', 

  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  todoItem: {
    backgroundColor: '#BFDBFE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  todoDescription: {
    fontSize: 16,
    color: '#555555',
  },
  noTodosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTodos: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TodoScreen;
