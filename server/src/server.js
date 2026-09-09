import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { createApp } from "./app.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT ?? 3001);
const DATA_FILE =
  process.env.DATA_FILE ?? resolve(__dirname, "..", "data", "tasks.json");

const app = createApp({ dataFile: DATA_FILE });

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log(`Persisting tasks to ${DATA_FILE}`);
});
