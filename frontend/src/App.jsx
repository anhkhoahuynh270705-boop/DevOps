import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/todos`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    await fetch(`${API_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo })
    });

    setNewTodo('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'DELETE'
    });
    fetchTodos();
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.title);
  };

  const saveEdit = async (id) => {
    await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingText })
    });

    setEditingId(null);
    setEditingText('');
    fetchTodos();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 DevOps Todo</h1>

      <div style={styles.inputGroup}>
        <input
          style={styles.input}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
        />
        <button style={styles.addBtn} onClick={addTodo}>
          Add
        </button>
      </div>

      <ul style={styles.list}>
        {todos.map(todo => (
          <li key={todo.id} style={styles.card}>

            {editingId === todo.id ? (
              <div style={styles.editBox}>
                <input
                  style={styles.input}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button style={styles.saveBtn} onClick={() => saveEdit(todo.id)}>Save</button>
                <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <div style={styles.todoRow}>
                <span style={styles.todoText}>{todo.title}</span>
                <div>
                  <button style={styles.editBtn} onClick={() => startEdit(todo)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => deleteTodo(todo.id)}>Delete</button>
                </div>
              </div>
            )}

          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    background: '#f5f7fa',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },

  title: {
    textAlign: 'center',
    marginBottom: '20px'
  },

  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },

  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    outline: 'none'
  },

  addBtn: {
    padding: '10px 15px',
    borderRadius: '8px',
    border: 'none',
    background: '#4CAF50',
    color: '#fff',
    cursor: 'pointer'
  },

  list: {
    listStyle: 'none',
    padding: 0
  },

  card: {
    background: '#fff',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
  },

  todoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  todoText: {
    fontSize: '16px'
  },

  editBtn: {
    marginRight: '8px',
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  deleteBtn: {
    background: '#f44336',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  editBox: {
    display: 'flex',
    gap: '10px'
  },

  saveBtn: {
    background: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  cancelBtn: {
    background: '#777',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default App;