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

  // 🧨 DELETE
  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'DELETE'
    });
    fetchTodos();
  };

  // ✏️ START EDIT
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.title);
  };

  // 💾 SAVE EDIT
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
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🚀 DevOps Todo App</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{
            border: '1px solid #ddd',
            marginBottom: '10px',
            padding: '10px'
          }}>

            {editingId === todo.id ? (
              <>
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button onClick={() => saveEdit(todo.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{todo.title}</span>
                <div>
                  <button onClick={() => startEdit(todo)}>Edit</button>
                  <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                </div>
              </>
            )}

          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;