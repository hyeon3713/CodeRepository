const BASE = "/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  listTasks: () => request("/tasks"),
  createTask: (title) =>
    request("/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    }),
  toggleTask: (id, done) =>
    request(`/tasks/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ done }),
    }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};
