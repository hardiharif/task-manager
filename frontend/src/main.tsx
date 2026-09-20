import React, { FormEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Status = "todo" | "in_progress" | "done";
type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  created_date: string;
};
const API = "http://localhost:8000/api";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("todo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/tasks`);
      if (!r.ok) throw new Error();
      setTasks(await r.json());
    } catch {
      setError("Could not connect to the API. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const r = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status }),
    });
    if (!r.ok) return setError("Could not create task.");
    setTitle("");
    setDescription("");
    setStatus("todo");
    setError("");
    loadTasks();
  };

  const changeStatus = async (id: string, next: Status) => {
    await fetch(`${API}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    loadTasks();
  };

  const removeTask = async (id: string) => {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  };

  const editTask = async (task: Task) => {
    const nextTitle = window.prompt("Task title:", task.title);
    if (nextTitle === null || !nextTitle.trim()) return;
    const nextDescription = window.prompt("Description:", task.description);
    if (nextDescription === null) return;
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle, description: nextDescription }),
    });
    loadTasks();
  };

  return (
    <main className="container">
      <header>
        <div>
          <p className="eyebrow">PRODUCTIVITY</p>
          <h1>Task Manager</h1>
          <p className="sub">Keep your work organized and moving forward.</p>
        </div>
        <div className="count">
          {tasks.length}
          <span> tasks</span>
        </div>
      </header>
      <section className="card">
        <h2>Create a task</h2>
        <form onSubmit={addTask}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            maxLength={200}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="formrow">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
            <button>Add task</button>
          </div>
        </form>
      </section>
      {error && <p className="error">{error}</p>}
      <section className="list">
        <h2>Your tasks</h2>
        {loading ? (
          <p>Loading…</p>
        ) : tasks.length === 0 ? (
          <div className="empty">
            No tasks yet. Create your first one above.
          </div>
        ) : (
          tasks.map((task) => (
            <article className="task" key={task.id}>
              <div className="taskmain">
                <div className="tasktop">
                  <h3>{task.title}</h3>
                  <span className={`badge ${task.status}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <p>{task.description || "No description"}</p>
                <small>
                  Created {new Date(task.created_date).toLocaleString()}
                </small>
              </div>
              <div className="actions">
                <select
                  value={task.status}
                  onChange={(e) =>
                    changeStatus(task.id, e.target.value as Status)
                  }
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
                <button className="secondary" onClick={() => editTask(task)}>
                  Edit
                </button>
                <button className="danger" onClick={() => removeTask(task.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
