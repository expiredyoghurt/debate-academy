// Single source of truth for the D1 schema.
// The Worker runs these on first request (CREATE IF NOT EXISTS), so no manual migration is needed.
// schema.sql is generated from this file: node scripts/make-schema-sql.mjs
export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pupils (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    display_name TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_login INTEGER,
    UNIQUE(class_id, username)
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    pupil_id INTEGER REFERENCES pupils(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS awards (
    pupil_id INTEGER NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    kind TEXT NOT NULL,
    xp INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (pupil_id, key)
  )`,
  `CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pupil_id INTEGER NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    motion TEXT NOT NULL,
    side TEXT,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    feedback TEXT,
    stars INTEGER,
    created_at INTEGER NOT NULL,
    reviewed_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS motions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'policy',
    hint TEXT,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS drafts (
    pupil_id INTEGER NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
    slot TEXT NOT NULL,
    payload TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (pupil_id, slot)
  )`,
  `CREATE TABLE IF NOT EXISTS login_fails (
    k TEXT NOT NULL,
    ts INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_pupils_class ON pupils(class_id)`,
  `CREATE INDEX IF NOT EXISTS idx_subs_pupil ON submissions(pupil_id)`,
  `CREATE INDEX IF NOT EXISTS idx_fails ON login_fails(k, ts)`,
];
