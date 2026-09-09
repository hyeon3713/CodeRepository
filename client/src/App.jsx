import { useEffect, useMemo, useState } from "react";

import { api } from "./api.js";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listTasks()
      .then((data) => {
        setTasks(data);
        setStatus("ready");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }, []);

  const remaining = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);

  async function handleSubmit(event) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    setError(null);
    try {
      const created = await api.createTask(value);
      setTasks((prev) => [created, ...prev]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(task) {
    try {
      const updated = await api.toggleTask(task.id, !task.done);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(task) {
    try {
      await api.deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="app">
      <section className="card">
        <header className="card__header">
          <h1>Tasks</h1>
          <p className="subtitle">
            {status === "ready"
              ? `${remaining} of ${tasks.length} remaining`
              : "Full-stack demo · React + Express"}
          </p>
        </header>

        <form className="composer" onSubmit={handleSubmit}>
          <input
            className="composer__input"
            placeholder="Add a new task…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Task title"
          />
          <button className="composer__button" type="submit">
            Add
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {status === "loading" && <p className="empty">Loading…</p>}

        {status === "ready" && tasks.length === 0 && (
          <p className="empty">No tasks yet. Add your first one above.</p>
        )}

        <ul className="list">
          {tasks.map((task) => (
            <li key={task.id} className={`item ${task.done ? "item--done" : ""}`}>
              <label className="item__label">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggle(task)}
                />
                <span className="item__title">{task.title}</span>
              </label>
              <button
                className="item__delete"
                onClick={() => handleDelete(task)}
                aria-label={`Delete ${task.title}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
