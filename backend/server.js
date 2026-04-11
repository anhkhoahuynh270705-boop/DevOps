require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// DB
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypass',
  database: process.env.DB_NAME || 'devops',
  port: process.env.DB_PORT || 5432,
});

// INIT DB
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE
    )
  `);
};

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// GET
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
app.post('/api/todos', async (req, res) => {
  try {
    const { title, completed = false } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const result = await pool.query(
      'INSERT INTO todos(title, completed) VALUES($1, $2) RETURNING *',
      [title.trim(), completed]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id=$1 RETURNING *',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, completed } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const result = await pool.query(
      'UPDATE todos SET title=$1, completed=$2 WHERE id=$3 RETURNING *',
      [title.trim(), completed ?? false, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER (QUAN TRỌNG)
const start = async () => {
  try {
    await initDB();

    if (process.env.NODE_ENV !== 'test') {
      const PORT = process.env.PORT || 8080;
      app.listen(PORT, () => {
        console.log(`🚀 Running on ${PORT}`);
      });
    }
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
  }
};

start();

// EXPORT CHUẨN CHO TEST
module.exports = { app, pool };