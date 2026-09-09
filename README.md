# CodeRepository

A minimal but complete full-stack **task manager**, used to bootstrap and validate a
Cloud Agent development environment. It runs fully offline with no external
services to provision.

## Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 18 + Vite (dev server on port `5173`) |
| Backend  | Express REST API (port `3001`)              |
| Storage  | JSON file (`server/data/tasks.json`)        |

The project is an [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)
monorepo:

```
.
├── client/   # React + Vite single-page app
└── server/   # Express REST API + JSON-file store
```

## Getting started

Requires Node.js 20+ (Node 22 recommended).

```bash
npm install        # install all workspace dependencies
npm run dev        # run API + client dev servers together
```

- Web app: http://localhost:5173
- API:     http://localhost:3001/api/health

The Vite dev server proxies `/api/*` requests to the Express server, so the
frontend and backend can be developed together with hot reload.

### Run each side individually

```bash
npm run dev:server   # Express API with --watch
npm run dev:client   # Vite dev server
```

### Tests

```bash
npm test             # runs the server's node:test API suite
```

## API

| Method   | Path              | Description               |
| -------- | ----------------- | ------------------------- |
| `GET`    | `/api/health`     | Liveness/uptime check     |
| `GET`    | `/api/tasks`      | List tasks (newest first) |
| `POST`   | `/api/tasks`      | Create a task             |
| `PATCH`  | `/api/tasks/:id`  | Toggle done / edit title  |
| `DELETE` | `/api/tasks/:id`  | Delete a task             |

## Cloud Agent environment

[`.cursor/environment.json`](.cursor/environment.json) configures the Cloud Agent
environment:

- **install:** `npm ci` — installs all workspace dependencies from the lockfile.
- **terminals:** long-running `server` and `client` dev servers.
- **ports:** `3001` (API) and `5173` (web).
