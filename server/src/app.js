import cors from "cors";
import express from "express";

import { TaskStore, ValidationError } from "./store.js";

export function createApp({ dataFile }) {
  const store = new TaskStore(dataFile);
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.get("/api/tasks", (_req, res) => {
    res.json(store.list());
  });

  app.post("/api/tasks", (req, res) => {
    try {
      const task = store.create(req.body?.title);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const task = store.update(req.params.id, req.body ?? {});
    if (!task) {
      res.status(404).json({ error: "task not found" });
      return;
    }
    res.json(task);
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const removed = store.remove(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "task not found" });
      return;
    }
    res.status(204).end();
  });

  return app;
}
