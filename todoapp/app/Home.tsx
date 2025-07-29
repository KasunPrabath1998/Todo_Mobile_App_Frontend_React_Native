import { useRouter, useNavigation } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

// Define the type for a TODO item
interface Todo {
  _id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

const HomeScreen: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  
  const navigation = useNavigation();

  // Hide the header for this screen
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Fetch userId from AsyncStorage on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error retrieving user ID:', error);
      }
    };

    getUserId();
  }, []);

  // Function to fetch todos from the API
  const fetchTodos = async () => {
    if (!userId) return; // Early exit if userId is not set

    try {
      const response = await axios.get(`http://10.0.2.2:3001/api/todos/${userId}`);
      console.log('Fetched todos:', response.data); 
      const todosData = Array.isArray(response.data) ? response.data : [];
      setTodos(todosData);
      setFilteredTodos(todosData); 
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Refetch todos whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTodos();
    }, [userId])
  );

  // Update filteredTodos based on searchQuery
  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = todos.filter(todo =>
        todo.title.toLowerCase().includes(lowercasedQuery) ||
        todo.description.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredTodos(filtered);
    } else {
      setFilteredTodos(todos);
    }
  }, [searchQuery, todos]);

  // Handle deletion of a todo item
  const handleDelete = (todoId: string) => {
    Alert.alert(
      'Confirm Delete', // Title of the alert
      'Are you sure you want to delete this TODO item?', // Message of the alert
      [
        { text: 'Cancel', style: 'cancel' }, // Button to cancel the delete action
        {
          text: 'OK', // Button to confirm the delete action
          onPress: async () => {
            try {
              if (userId) {
                await axios.delete(`http://10.0.2.2:3001/api/todos/${userId}/${todoId}`);
                // Update the states after deletion
                const updatedTodos = todos.filter(todo => todo._id !== todoId);
                setTodos(updatedTodos);
                setFilteredTodos(updatedTodos.filter(todo => 
                  todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  todo.description.toLowerCase().includes(searchQuery.toLowerCase())
                ));
              } else {
                console.log('No user ID found');
              }
            } catch (error) {
              console.error('Error deleting todo:', error);
            }
          },
        },
      ],
      { cancelable: true } // Allow users to dismiss the alert by clicking outside
    );
  };
  

  // Handle navigation to the details page
  const handleViewDetails = async (todoId: string) => {
    if (!userId || !todoId) {
      console.log('Missing user ID or Todo ID');
      return;
    }

    try {
      await router.push(`./Task Details?userId=${userId}&todoId=${todoId}`);
    } catch (error) {
      console.error('Error navigating to todo details:', error);
    }
  };

  // Render a single todo item
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.listItem}>
      <View style={styles.todoTextContainer}>
        <Text style={styles.listItemTitle}>{item.title || 'No Title Available'}</Text>
        <Text style={styles.listItemDueDate}>Allocate Date: {moment(item.due_date).format('YYYY-MM-DD')}</Text>
        <Text style={styles.listItemDueDate}>Time: {moment(item.due_date).format('HH:mm')}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => handleViewDetails(item._id)}>
          <Icon name="eye" size={24} color="#007BFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Icon name="trash" size={24} color="#E53E3E" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
   
      <View style={styles.todoListContainer}>
        <Text style={styles.title}>Add New Tasks</Text>
        <TouchableOpacity onPress={() => router.push('./Addtodolist')} style={styles.addButton}>
          <Icon name="plus-circle" size={48} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={20} color="#4F4F4F" />
        </View>
        <Text style={styles.latestTitle}>My Latest Tasks</Text>
        {filteredTodos.length > 0 ? (
          <FlatList
            data={filteredTodos}
            keyExtractor={(item) => item._id}
            renderItem={renderTodoItem}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.noTodos}>No relevant todos available.</Text>
        )}
      </View>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  todoListContainer: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  title: {
    color: '#1D4ED8',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  latestTitle: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  addButton: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dce2f1',
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    width: '90%',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
  },
  listContent: {
    flexGrow: 1,
    width: '90%',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#BFDBFE',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    width: '100%',
  },
  todoTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  listItemDueDate: {
    color: '#4B5563',
  },
  noTodos: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 60,
  },
});

export default HomeScreen;
