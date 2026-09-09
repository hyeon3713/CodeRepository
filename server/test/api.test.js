import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

import { createApp } from "../src/app.js";

let server;
let baseUrl;
let tmpDir;

before(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "tasks-test-"));
  const app = createApp({ dataFile: join(tmpDir, "tasks.json") });
  await new Promise((resolveListen) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolveListen();
    });
  });
});

after(() => {
  server?.close();
  if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
});

test("starts with an empty task list", async () => {
  const res = await fetch(`${baseUrl}/api/tasks`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test("creates, updates and deletes a task", async () => {
  const createRes = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "write docs" }),
  });
  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  assert.equal(created.title, "write docs");
  assert.equal(created.done, false);
  assert.ok(created.id);

  const patchRes = await fetch(`${baseUrl}/api/tasks/${created.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ done: true }),
  });
  assert.equal(patchRes.status, 200);
  assert.equal((await patchRes.json()).done, true);

  const delRes = await fetch(`${baseUrl}/api/tasks/${created.id}`, {
    method: "DELETE",
  });
  assert.equal(delRes.status, 204);

  const listRes = await fetch(`${baseUrl}/api/tasks`);
  assert.deepEqual(await listRes.json(), []);
});

test("rejects an empty title", async () => {
  const res = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "   " }),
  });
  assert.equal(res.status, 400);
});
