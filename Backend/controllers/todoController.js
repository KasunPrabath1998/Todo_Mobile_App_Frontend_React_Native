// controllers/todoController.js
const Todo = require('../models/todo');
const mongoose = require('mongoose'); 

// Add Todo
exports.addTodo = async (req, res) => {
  try {
    const { title, description, date, time, userId } = req.body;

    if (!title || !description || !date || !time || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const due_date = new Date(`${date}T${time}`);
    if (isNaN(due_date.getTime())) {
      return res.status(400).json({ message: 'Invalid date or time format' });
    }

    const newTodo = new Todo({
      title,
      description,
      due_date,
      userId
    });
    await newTodo.save();

    res.status(201).json({ message: 'Todo added successfully', todo: newTodo });
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Show Todos by user
exports.getTodosByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const todos = await Todo.find({ userId });

    if (todos.length === 0) {
      return res.status(404).json({ message: 'No todos found for this user' });
    }

    res.status(200).json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error.message);  // Log specific error message
    res.status(500).json({ message: 'Internal Server Error', error: error.message });  // Include error message in response
  }
};

  

// Update Todo
exports.updateTodo = async (req, res) => {
  try {
      const { userId, todoId } = req.params;
      const { title, description, date, time } = req.body;

      // Log the inputs for debugging
      console.log('userId:', userId);
      console.log('todoId:', todoId);
      console.log('title:', title);
      console.log('description:', description);
      console.log('date:', date);
      console.log('time:', time);

      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(todoId)) {
          return res.status(400).json({ message: 'Invalid parameters' });
      }

      const updatedTodo = await Todo.findOneAndUpdate(
          { _id: todoId, userId: userId },
          { title, description, date, time },
          { new: true, runValidators: true }  
      );

      if (!updatedTodo) {
          return res.status(404).json({ message: 'Todo not found' });
      }

      res.status(200).json({ message: 'Todo updated successfully', todo: updatedTodo });
  } catch (err) {
      console.error('Error updating todo:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};
















// Delete Todo
exports.deleteTodo = async (req, res) => {
  try {
    const { userId, todoId } = req.params;

    console.log('userId:', userId);
    console.log('todoId:', todoId);

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(todoId)) {
        return res.status(400).json({ message: 'Invalid parameters' });
    }

    const result = await Todo.deleteOne({ _id: todoId, userId });

    if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




// Calender
exports.getTodoaccordingtoClender = async (req, res) => {
  try {
    const { userId, date } = req.params;

    if (!userId || !date) {
      return res.status(400).json({ message: 'UserId and date are required' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const todos = await Todo.find({
      userId: userId,
      due_date: { $gte: startOfDay, $lt: endOfDay }
    });

    if (todos.length === 0) {
      return res.status(404).json({ message: 'No task found for this date' });
    }

    res.status(200).json(todos);
  } catch (err) {
    console.error('Error fetching TODO items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//todo eka ebuwama wisthara penweema
exports.getTododetails = async (req, res) => {
  try {
      const { userId, todoId } = req.params;

      console.log('Received userId:', userId);
      console.log('Received todoId:', todoId);

      // Check if IDs are valid ObjectId instances
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(todoId)) {
          console.log('Invalid parameters');
          return res.status(400).json({ message: 'Invalid parameters' });
      }

      // Use new mongoose.Types.ObjectId() to create ObjectId instances
      const todo = await Todo.findOne({ 
          _id: new mongoose.Types.ObjectId(todoId), 
          userId: new mongoose.Types.ObjectId(userId) 
      });

      if (!todo) {
          console.log('Todo not found');
          return res.status(404).json({ message: 'Todo not found' });
      }

      
      res.status(200).json(todo);
  } catch (err) {
      console.error('Error fetching todo:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};


