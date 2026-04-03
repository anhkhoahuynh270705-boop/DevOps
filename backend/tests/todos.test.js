// backend/server.js
const express = require('express');
const app = express();

app.use(express.json());

let todos = [];
let idCounter = 1;

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// GET all todos
app.get('/api/todos', (req, res) => {
  res.status(200).json(todos);
});

// POST create todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const todo = { id: idCounter++, title: title.trim(), completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos.splice(index, 1);
  res.status(200).json({ message: 'Deleted' });
});

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  const { title, completed } = req.body;
  if (title !== undefined) todo.title = title.trim();
  if (completed !== undefined) todo.completed = completed;
  res.status(200).json(todo);
});

module.exports = app;
