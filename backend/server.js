require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// 🔐 Security + middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// 🎯 Auto detect environment
const isDocker = process.env.DB_HOST === 'postgres';

// 🔥 DB CONFIG CHUẨN
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  max: 20,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// ✅ Test DB connection khi start server
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ DB connection error:', err.message));

// 🩺 Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0.0' });
});

// 📥 GET todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ➕ CREATE todo
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ❌ DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM todos WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ UPDATE todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const result = await pool.query(
      'UPDATE todos SET title=$1, completed=$2 WHERE id=$3 RETURNING *',
      [title.trim(), completed ?? false, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;