// OYMT project dashboard server.
// Serves the static dashboard and a tiny API that stores shared checkbox state.
//
// Storage:
//   - If DATABASE_URL is set (Railway Postgres), state is saved there.
//   - Otherwise it falls back to in-memory storage so the app still runs
//     locally, but that resets on restart. Add a Postgres database in
//     production so progress survives deploys.
//
// Optional access control:
//   - If APP_PASSWORD is set, the whole site asks for a shared password
//     (browser login box). Username can be anything; the password must match.

const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD;
const MAX_ID_LEN = 64;
const MAX_NAME_LEN = 80;

// ---- Optional shared-password protection ----
if (APP_PASSWORD) {
  app.use((req, res, next) => {
    const header = req.headers.authorization || "";
    const [scheme, encoded] = header.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString();
      const password = decoded.slice(decoded.indexOf(":") + 1);
      if (password === APP_PASSWORD) return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="OYMT Dashboard"');
    return res.status(401).send("Authentication required");
  });
}

// ---- Storage ----
let store;

async function initStore() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
    });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_state (
        task_id    TEXT PRIMARY KEY,
        done       BOOLEAN NOT NULL DEFAULT false,
        updated_by TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    store = {
      async getAll() {
        const { rows } = await pool.query(
          "SELECT task_id, done, updated_by, updated_at FROM task_state"
        );
        const out = {};
        for (const r of rows) {
          out[r.task_id] = { done: r.done, by: r.updated_by, at: r.updated_at };
        }
        return out;
      },
      async set(id, done, by) {
        await pool.query(
          `INSERT INTO task_state (task_id, done, updated_by, updated_at)
           VALUES ($1, $2, $3, now())
           ON CONFLICT (task_id)
           DO UPDATE SET done = $2, updated_by = $3, updated_at = now()`,
          [id, done, by]
        );
      },
      async reset() {
        await pool.query("DELETE FROM task_state");
      },
    };
    console.log("Storage: Postgres (shared, persistent)");
  } else {
    const mem = new Map();
    store = {
      async getAll() {
        const out = {};
        for (const [k, v] of mem) out[k] = v;
        return out;
      },
      async set(id, done, by) {
        mem.set(id, { done, by: by || null, at: new Date().toISOString() });
      },
      async reset() {
        mem.clear();
      },
    };
    console.warn(
      "Storage: in-memory (resets on restart). Set DATABASE_URL to use Postgres."
    );
  }
}

// ---- API ----
app.get("/api/state", async (req, res) => {
  try {
    res.json(await store.getAll());
  } catch (e) {
    console.error("GET /api/state", e);
    res.status(500).json({ error: "storage error" });
  }
});

app.post("/api/state", async (req, res) => {
  const { id, done, by } = req.body || {};
  if (typeof id !== "string" || !id || id.length > MAX_ID_LEN || typeof done !== "boolean") {
    return res.status(400).json({ error: "expected { id: string, done: boolean }" });
  }
  const cleanBy = typeof by === "string" && by.trim() ? by.trim().slice(0, MAX_NAME_LEN) : null;
  try {
    await store.set(id, done, cleanBy);
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/state", e);
    res.status(500).json({ error: "storage error" });
  }
});

app.post("/api/reset", async (req, res) => {
  try {
    await store.reset();
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/reset", e);
    res.status(500).json({ error: "storage error" });
  }
});

// ---- Static site ----
app.use(express.static(path.join(__dirname, "public")));

initStore()
  .then(() => {
    app.listen(PORT, () => console.log(`OYMT dashboard listening on port ${PORT}`));
  })
  .catch((e) => {
    console.error("Failed to start:", e);
    process.exit(1);
  });
