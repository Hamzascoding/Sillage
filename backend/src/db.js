import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { buildSeed } from "./seed.js";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = process.env.DB_FILE || path.join(here, "..", "data", "db.json");
const IN_MEMORY = DB_FILE === ":memory:";

let state = null;

const hashPassword = (password) => require("bcryptjs").hashSync(password, 10);

export function load() {
  if (state) return state;
  if (!IN_MEMORY && fs.existsSync(DB_FILE)) {
    state = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } else {
    state = buildSeed({ hash: hashPassword });
    save();
  }
  return state;
}

export function save() {
  if (IN_MEMORY || !state) return;
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

export function nextId(collection) {
  const items = load()[collection];
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

export function resetDb(newState) {
  state = newState ?? buildSeed({ hash: hashPassword });
  save();
  return state;
}
