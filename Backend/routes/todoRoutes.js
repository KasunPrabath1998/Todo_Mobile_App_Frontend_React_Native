// routes/todoRoutes.js
const express = require('express');
const router = express.Router();
const { addTodo, getTodosByUser, updateTodo, deleteTodo, getTodoaccordingtoClender, getTododetails } = require('../controllers/todoController');

router.post('/add', addTodo);
router.get('/:userId', getTodosByUser);
router.put('/:userId/:todoId', updateTodo);
router.delete('/:userId/:todoId', deleteTodo);
router.get('/:userId/date/:date', getTodoaccordingtoClender);
router.get('/:userId/:todoId', getTododetails);








module.exports = router;
