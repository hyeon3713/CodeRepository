import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * A tiny JSON-file-backed task store. It deliberately avoids any external
 * database so the development environment runs fully offline with zero
 * infrastructure to provision.
 */
export class TaskStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.tasks = this.#load();
  }

  #load() {
    if (!existsSync(this.filePath)) {
      return [];
    }
    try {
      const raw = readFileSync(this.filePath, "utf8").trim();
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // A corrupt file should not crash the server; start from an empty list.
      return [];
    }
  }

  #persist() {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
  }

  list() {
    return [...this.tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  create(title) {
    const trimmed = String(title ?? "").trim();
    if (!trimmed) {
      throw new ValidationError("title is required");
    }
    const task = {
      id: randomUUID(),
      title: trimmed,
      done: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    this.#persist();
    return task;
  }

  update(id, patch) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;
    if (typeof patch.done === "boolean") {
      task.done = patch.done;
    }
    if (typeof patch.title === "string" && patch.title.trim()) {
      task.title = patch.title.trim();
    }
    this.#persist();
    return task;
  }

  remove(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    this.#persist();
    return true;
  }
}

export class ValidationError extends Error {}
