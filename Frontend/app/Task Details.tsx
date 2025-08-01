import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Todo {
  id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const optionsDate: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

  return {
    date: date.toLocaleDateString('en-US', optionsDate),
    time: date.toLocaleTimeString('en-US', optionsTime),
  };
};

const TodoDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { todoId } = route.params as { todoId: number };
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(todo?.due_date || Date.now()));
  const [selectedTime, setSelectedTime] = useState(new Date(todo?.due_date || Date.now()));

  useEffect(() => {
    const fetchTodoDetails = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.log('No user ID found');
          Alert.alert('Error', 'No user ID found.');
          return;
        }
      
        const response = await axios.get(`http://10.0.2.2:3001/api/todos/${userId}/${todoId}`);  
        if (response.status === 200) {
          setTodo(response.data);
          setUpdatedTitle(response.data.title);
          setUpdatedDescription(response.data.description);
          setSelectedDate(new Date(response.data.due_date));
          setSelectedTime(new Date(response.data.due_date));
        } else {
          console.error('Error fetching todo details:', response.statusText);
          Alert.alert('Error', 'Failed to fetch todo details. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching todo details:', error);
        Alert.alert('Error', 'An error occurred while fetching todo details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTodoDetails();
  }, [todoId]);

  const handleUpdate = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('No user ID found');
        Alert.alert('Error', 'No user ID found.');
        return;
      }

      const response = await axios.put(`http://10.0.2.2:3001/api/todos/${userId}/${todoId}`, { 
        title: updatedTitle,
        description: updatedDescription,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime.toTimeString().split(' ')[0],
      });

      if (response.status === 200) {
        setTodo(response.data.todo);
        setIsEditing(false);
        Alert.alert('Success', 'Todo updated successfully.');
      } else {
        console.error('Error updating todo:', response.statusText);
        Alert.alert('Error', 'Failed to update todo. Please try again later.');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      Alert.alert('Error', 'An error occurred while updating todo.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Completion',
      'Are you sure you want to complete this tasks?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = await AsyncStorage.getItem('userId');
              if (!userId) {
                console.log('No user ID found');
                Alert.alert('Error', 'No user ID found.');
                return;
              }
  
              const response = await axios.delete(`http://10.0.2.2:3001/api/todos/delete/${todoId}`);
              if (response.status === 200) {
                Alert.alert('Success', 'Todo completed successfully.');
                navigation.goBack();
              } else {
                console.error('Error deleting todo:', response.statusText);
                Alert.alert('Error', 'Failed to delete todo. Please try again later.');
              }
            } catch (error) {
              console.error('Error deleting todo:', error);
              Alert.alert('Error', 'An error occurred while deleting todo.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!todo) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTodo}>Todo not found.</Text>
      </View>
    );
  }

  const dueDateTime = formatDateTime(todo.due_date);
  const createdAtDateTime = formatDateTime(todo.created_at);

  return (
    <ScrollView contentContainerStyle={styles.container}>
     
      <View style={styles.content}>
       

        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={updatedTitle}
              onChangeText={setUpdatedTitle}
              placeholder="Title"
            />
            <TextInput
              style={styles.input}
              value={updatedDescription}
              onChangeText={setUpdatedDescription}
              placeholder="Description"
              multiline
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text>Select Date: {selectedDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDelete} 

              />
            )}
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
              <Text>Select Time: {selectedTime.toTimeString().split(' ')[0]}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
             <View style={styles.container}>
                    <Button title="Save Changes" onPress={handleUpdate} />
                 <View style={styles.buttonContainer}>
                    <Button title="Cancel" onPress={() => setIsEditing(false)} color="#FF3B30" />
                </View>
           </View>
          </>
        ) : (
          <>
            <Text style={styles.description}>{todo.description}</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Task Allocate Date:</Text>
              <Text style={styles.dateValue}>{dueDateTime.date}</Text>
              <Text style={styles.timeLabel}>Time:</Text>
              <Text style={styles.timeValue}>{dueDateTime.time}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Task Created Date:</Text>
              <Text style={styles.dateValue}>{createdAtDateTime.date}</Text>
              <Text style={styles.timeLabel}>Time:</Text>
              <Text style={styles.timeValue}>{createdAtDateTime.time}</Text>
            </View>
            <View style={styles.container}>
            <View style={styles.buttonContainer}>
              <Button title="Edit" onPress={() => setIsEditing(true)} color="#1D4ED8" />
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Complete" onPress={handleDelete} color="#2ac82f" />
            </View>
          </View>
          </>
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center', 
  },
  buttonContainer: {
    marginTop: 10, 
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
    marginTop: 50,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
  },
  dateValue: {
    fontSize: 16,
    color: '#333333',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
  },
  timeValue: {
    fontSize: 16,
    color: '#333333',
  },
  noTodo: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
 
  },
});

export default TodoDetailScreen;
