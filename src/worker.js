import { SCHEMA } from './schema.js';

/* ------------------------------------------------------------------ *
 *  Debate Academy – Cloudflare Worker API (D1)
 *  Teacher login: secrets admin_user / admin_password.
 *  Until they are set, defaults are Admin / Password123 (per brief).
 * ------------------------------------------------------------------ */

const DEFAULT_ADMIN_USER = 'Admin';
const DEFAULT_ADMIN_PASSWORD = 'Password123';

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const ADMIN_SESSION_MS = 12 * HOUR;
const PUPIL_SESSION_MS = 14 * DAY;

// XP the server will accept from the client, by activity kind.
const XP_RULES = {
  learn: { max: 30, daily: 1 },
  sort:  { max: 60, daily: 3 },
  order: { max: 45, daily: 3 },
  spot:  { max: 20, daily: 6 },
  name:  { max: 60, daily: 3 },   // Name That Rebuttal drill
  lab:   { max: 15, daily: 12 },  // Rebuttal Lab (one award per case + starter)
  toolkit: { max: 30, daily: 1 }, // Rebuttal Toolkit lesson (once)
};
// One-time awards: the key must equal the kind, so they can only ever be paid once.
const ONCE_KINDS = new Set(['learn', 'toolkit']);
const SUBMIT_XP = 40;
const SUBMIT_DAILY = 5;
const REVIEW_XP_PER_STAR = 15;

const enc = new TextEncoder();
let schemaPromise = null;

/* ------------------------------ helpers ----------------------------- */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
const fail = (status, message) => json({ error: message }, status);

function ensureSchema(env) {
  if (!schemaPromise) {
    schemaPromise = env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s))).catch((e) => {
      schemaPromise = null;
      throw e;
    });
  }
  return schemaPromise;
}

function clean(v, max) {
  return String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
}

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function sha256Hex(s) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}
function randomHex(bytes) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}
async function safeEqual(a, b) {
  const [x, y] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const A = new Uint8Array(x);
  const B = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < A.length; i++) diff |= A[i] ^ B[i];
  return diff === 0;
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
function genCode(len = 6) {
  const r = crypto.getRandomValues(new Uint8Array(len));
  return [...r].map((n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join('');
}

async function readJson(request) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > 200000) return null;
  try {
    const text = await request.text();
    if (text.length > 200000) return null;
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

// Recursively clip strings so a client cannot store huge blobs.
function sanitizePayload(v, depth = 0) {
  if (depth > 3) return null;
  if (typeof v === 'string') return clean(v, 2000);
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.slice(0, 20).map((x) => sanitizePayload(x, depth + 1));
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v).slice(0, 30)) {
      out[clean(k, 40)] = sanitizePayload(v[k], depth + 1);
    }
    return out;
  }
  return null;
}

/* ----------------------------- rate limit --------------------------- */

async function tooManyFails(env, key, limit) {
  const since = Date.now() - 10 * 60 * 1000;
  const row = await env.DB.prepare('SELECT COUNT(*) AS c FROM login_fails WHERE k = ? AND ts > ?')
    .bind(key, since)
    .first();
  return (row?.c || 0) >= limit;
}
async function recordFail(env, key) {
  await env.DB.prepare('INSERT INTO login_fails (k, ts) VALUES (?, ?)').bind(key, Date.now()).run();
  if (Math.random() < 0.05) {
    await env.DB.prepare('DELETE FROM login_fails WHERE ts < ?').bind(Date.now() - HOUR).run();
    await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()).run();
  }
}

/* ------------------------------ sessions ---------------------------- */

async function createSession(env, role, pupilId, ttl) {
  const token = randomHex(32);
  const hash = await sha256Hex(token);
  await env.DB.prepare('INSERT INTO sessions (token_hash, role, pupil_id, expires_at) VALUES (?, ?, ?, ?)')
    .bind(hash, role, pupilId, Date.now() + ttl)
    .run();
  return token;
}

async function getAuth(request, env) {
  const m = (request.headers.get('authorization') || '').match(/^Bearer ([a-f0-9]{64})$/i);
  if (!m) return null;
  const hash = await sha256Hex(m[1].toLowerCase());
  const row = await env.DB.prepare('SELECT role, pupil_id, expires_at FROM sessions WHERE token_hash = ?')
    .bind(hash)
    .first();
  if (!row || row.expires_at < Date.now()) return null;
  return { role: row.role, pupilId: row.pupil_id, hash };
}

/* -------------------------------- XP -------------------------------- */

async function awardXp(env, pupilId, key, kind, xp) {
  const res = await env.DB.prepare(
    'INSERT OR IGNORE INTO awards (pupil_id, key, kind, xp, created_at) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(pupilId, key, kind, xp, Date.now())
    .run();
  if (!res.meta.changes) return false;
  await env.DB.prepare('UPDATE pupils SET xp = xp + ? WHERE id = ?').bind(xp, pupilId).run();
  return true;
}
async function todayCount(env, pupilId, kind) {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM awards WHERE pupil_id = ? AND kind = ? AND created_at > ?'
  )
    .bind(pupilId, kind, Date.now() - DAY)
    .first();
  return row?.c || 0;
}
async function pupilXp(env, pupilId) {
  const row = await env.DB.prepare('SELECT xp FROM pupils WHERE id = ?').bind(pupilId).first();
  return row?.xp || 0;
}

/* ------------------------------- router ----------------------------- */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      await ensureSchema(env);
      return await route(request, env, url);
    } catch (e) {
      console.error('API error', e && e.stack ? e.stack : e);
      return fail(500, 'Something went wrong on the server.');
    }
  },
};

async function route(request, env, url) {
  const method = request.method;
  const path = url.pathname;
  const seg = path.split('/').filter(Boolean); // ['api', ...]

  let body = {};
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    body = await readJson(request);
    if (body === null || typeof body !== 'object') return fail(400, 'Bad request.');
  }

  if (path === '/api/health') return json({ ok: true });

  if (method === 'POST' && path === '/api/login/pupil') return loginPupil(request, env, body);
  if (method === 'POST' && path === '/api/login/admin') return loginAdmin(request, env, body);

  const auth = await getAuth(request, env);
  if (!auth) return fail(401, 'Please sign in.');

  if (method === 'POST' && path === '/api/logout') {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(auth.hash).run();
    return json({ ok: true });
  }

  if (seg[1] === 'admin') {
    if (auth.role !== 'admin') return fail(403, 'Teachers only.');
    return adminRoute(request, env, url, seg, method, body);
  }
  if (auth.role !== 'pupil' || !auth.pupilId) return fail(403, 'Pupils only.');
  return pupilRoute(request, env, url, seg, method, body, auth.pupilId);
}

/* -------------------------------- login ----------------------------- */

async function loginPupil(request, env, body) {
  const username = clean(body.username, 40).toLowerCase();
  const code = clean(body.classCode, 12).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!username || !code) return fail(400, 'Enter your username and class code.');

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = `pupil:${ip}:${code}`;
  // Generous limit: a whole class often shares one school IP.
  if (await tooManyFails(env, key, 60)) return fail(429, 'Too many tries. Please wait a few minutes.');

  const p = await env.DB.prepare(
    `SELECT p.id FROM pupils p JOIN classes c ON c.id = p.class_id
     WHERE c.code = ? AND p.username = ?`
  )
    .bind(code, username)
    .first();
  if (!p) {
    await recordFail(env, key);
    return fail(401, 'That username and class code do not match. Check your card.');
  }
  await env.DB.prepare('UPDATE pupils SET last_login = ? WHERE id = ?').bind(Date.now(), p.id).run();
  const token = await createSession(env, 'pupil', p.id, PUPIL_SESSION_MS);
  return json({ token, role: 'pupil' });
}

async function loginAdmin(request, env, body) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = `admin:${ip}`;
  if (await tooManyFails(env, key, 10)) return fail(429, 'Too many attempts. Please wait ten minutes.');

  const wantUser = env.admin_user ? String(env.admin_user) : DEFAULT_ADMIN_USER;
  const wantPass = env.admin_password ? String(env.admin_password) : DEFAULT_ADMIN_PASSWORD;
  const okUser = await safeEqual(clean(body.username, 100), wantUser);
  const okPass = await safeEqual(String(body.password ?? '').slice(0, 200), wantPass);
  if (!(okUser && okPass)) {
    await recordFail(env, key);
    return fail(401, 'Wrong username or password.');
  }
  const token = await createSession(env, 'admin', null, ADMIN_SESSION_MS);
  return json({
    token,
    role: 'admin',
    defaults: { user: !env.admin_user, password: !env.admin_password },
  });
}

/* ------------------------------- pupils ----------------------------- */

async function pupilRoute(request, env, url, seg, method, body, pupilId) {
  const r = seg.slice(1).join('/');

  if (method === 'GET' && r === 'me') {
    const p = await env.DB.prepare(
      `SELECT p.id, p.username, p.display_name, p.xp, c.name AS class_name, c.id AS class_id
       FROM pupils p JOIN classes c ON c.id = p.class_id WHERE p.id = ?`
    )
      .bind(pupilId)
      .first();
    if (!p) return fail(401, 'Please sign in.');
    const subs = await env.DB.prepare(
      'SELECT kind, COUNT(*) AS n FROM submissions WHERE pupil_id = ? GROUP BY kind'
    )
      .bind(pupilId)
      .all();
    const awards = await env.DB.prepare('SELECT kind, COUNT(*) AS n FROM awards WHERE pupil_id = ? GROUP BY kind')
      .bind(pupilId)
      .all();
    const reviewed = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM submissions WHERE pupil_id = ? AND status = 'reviewed'"
    )
      .bind(pupilId)
      .first();
    const toMap = (res) => Object.fromEntries((res.results || []).map((x) => [x.kind, x.n]));
    return json({
      pupil: {
        id: p.id,
        username: p.username,
        displayName: p.display_name,
        xp: p.xp,
        className: p.class_name,
        classId: p.class_id,
      },
      stats: { submissions: toMap(subs), awards: toMap(awards), reviewed: reviewed?.n || 0 },
    });
  }

  if (method === 'GET' && r === 'motions') {
    const me = await env.DB.prepare('SELECT class_id FROM pupils WHERE id = ?').bind(pupilId).first();
    const rows = await env.DB.prepare(
      'SELECT id, text, kind, hint FROM motions WHERE class_id IS NULL OR class_id = ? ORDER BY id DESC LIMIT 100'
    )
      .bind(me?.class_id ?? -1)
      .all();
    return json({ motions: rows.results || [] });
  }

  if (method === 'POST' && r === 'award') {
    const kind = clean(body.kind, 20);
    const key = clean(body.key, 64);
    const rule = XP_RULES[kind];
    if (!rule || !/^[A-Za-z0-9:_-]{1,64}$/.test(key)) return fail(400, 'Bad award.');
    const xp = Math.max(0, Math.min(rule.max, Math.floor(Number(body.xp) || 0)));
    if (xp <= 0) return json({ awarded: 0, xp: await pupilXp(env, pupilId) });
    if (ONCE_KINDS.has(kind) && key !== kind) return fail(400, 'Bad award.');
    if (!ONCE_KINDS.has(kind) && (await todayCount(env, pupilId, kind)) >= rule.daily) {
      return json({ awarded: 0, capped: true, xp: await pupilXp(env, pupilId) });
    }
    const ok = await awardXp(env, pupilId, key, kind, xp);
    return json({ awarded: ok ? xp : 0, xp: await pupilXp(env, pupilId) });
  }

  if (r.startsWith('draft/')) {
    const slot = seg[2] || '';
    if (!/^[a-z0-9:_-]{1,32}$/.test(slot)) return fail(400, 'Bad draft.');
    if (method === 'GET') {
      const row = await env.DB.prepare('SELECT payload, updated_at FROM drafts WHERE pupil_id = ? AND slot = ?')
        .bind(pupilId, slot)
        .first();
      return json({ draft: row ? JSON.parse(row.payload) : null, updatedAt: row?.updated_at || null });
    }
    if (method === 'PUT') {
      const payload = JSON.stringify(sanitizePayload(body.payload));
      if (payload.length > 20000) return fail(413, 'Draft too large.');
      await env.DB.prepare(
        `INSERT INTO drafts (pupil_id, slot, payload, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(pupil_id, slot) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`
      )
        .bind(pupilId, slot, payload, Date.now())
        .run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM drafts WHERE pupil_id = ? AND slot = ?').bind(pupilId, slot).run();
      return json({ ok: true });
    }
  }

  if (method === 'POST' && r === 'submissions') {
    const kind = clean(body.kind, 20);
    if (kind !== 'substantive' && kind !== 'rebuttal') return fail(400, 'Bad submission type.');
    const motion = clean(body.motion, 300);
    const side = body.side === 'Proposition' || body.side === 'Opposition' ? body.side : null;
    if (!motion || !side) return fail(400, 'Choose a motion and a side first.');
    const payload = JSON.stringify(sanitizePayload(body.payload));
    if (payload.length > 15000) return fail(413, 'Submission too large.');

    const res = await env.DB.prepare(
      `INSERT INTO submissions (pupil_id, kind, motion, side, payload, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', ?)`
    )
      .bind(pupilId, kind, motion, side, payload, Date.now())
      .run();
    const id = res.meta.last_row_id;

    let awarded = 0;
    if ((await todayCount(env, pupilId, 'submit')) < SUBMIT_DAILY) {
      if (await awardXp(env, pupilId, `sub:${id}`, 'submit', SUBMIT_XP)) awarded = SUBMIT_XP;
    }
    return json({ id, awarded, xp: await pupilXp(env, pupilId) });
  }

  if (method === 'GET' && r === 'submissions/mine') {
    const rows = await env.DB.prepare(
      `SELECT id, kind, motion, side, payload, status, feedback, stars, created_at
       FROM submissions WHERE pupil_id = ? ORDER BY id DESC LIMIT 100`
    )
      .bind(pupilId)
      .all();
    return json({
      submissions: (rows.results || []).map((s) => ({ ...s, payload: safeParse(s.payload) })),
    });
  }

  return fail(404, 'Not found.');
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

/* -------------------------------- admin ----------------------------- */

const usernameBase = (name) =>
  String(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12) || 'pupil';

async function adminRoute(request, env, url, seg, method, body) {
  const r = seg.slice(2).join('/'); // after /api/admin/

  if (method === 'GET' && r === 'status') {
    return json({ defaults: { user: !env.admin_user, password: !env.admin_password } });
  }

  /* ---- classes ---- */
  if (method === 'GET' && r === 'classes') {
    const rows = await env.DB.prepare(
      `SELECT c.id, c.name, c.code, c.created_at,
              (SELECT COUNT(*) FROM pupils p WHERE p.class_id = c.id) AS pupils
       FROM classes c ORDER BY c.id DESC`
    ).all();
    return json({ classes: rows.results || [] });
  }
  if (method === 'POST' && r === 'classes') {
    const name = clean(body.name, 60);
    if (!name) return fail(400, 'Give the class a name.');
    for (let i = 0; i < 8; i++) {
      const code = genCode();
      try {
        const res = await env.DB.prepare('INSERT INTO classes (name, code, created_at) VALUES (?, ?, ?)')
          .bind(name, code, Date.now())
          .run();
        return json({ id: res.meta.last_row_id, name, code });
      } catch (e) {
        if (!/UNIQUE/i.test(String(e))) throw e;
      }
    }
    return fail(500, 'Could not create a unique class code. Try again.');
  }
  let m = r.match(/^classes\/(\d+)$/);
  if (m && method === 'DELETE') {
    await env.DB.prepare('DELETE FROM classes WHERE id = ?').bind(Number(m[1])).run();
    return json({ ok: true });
  }
  m = r.match(/^classes\/(\d+)\/regen$/);
  if (m && method === 'POST') {
    for (let i = 0; i < 8; i++) {
      const code = genCode();
      try {
        await env.DB.prepare('UPDATE classes SET code = ? WHERE id = ?').bind(code, Number(m[1])).run();
        return json({ code });
      } catch (e) {
        if (!/UNIQUE/i.test(String(e))) throw e;
      }
    }
    return fail(500, 'Could not create a unique class code. Try again.');
  }

  /* ---- pupils ---- */
  m = r.match(/^classes\/(\d+)\/pupils$/);
  if (m && method === 'GET') {
    const cls = await env.DB.prepare('SELECT id, name, code FROM classes WHERE id = ?').bind(Number(m[1])).first();
    if (!cls) return fail(404, 'Class not found.');
    const rows = await env.DB.prepare(
      `SELECT id, username, display_name, xp, last_login FROM pupils WHERE class_id = ? ORDER BY display_name COLLATE NOCASE`
    )
      .bind(cls.id)
      .all();
    return json({ class: cls, pupils: rows.results || [] });
  }
  if (m && method === 'POST') {
    const classId = Number(m[1]);
    const cls = await env.DB.prepare('SELECT id FROM classes WHERE id = ?').bind(classId).first();
    if (!cls) return fail(404, 'Class not found.');
    const lines = Array.isArray(body.lines) ? body.lines.slice(0, 120) : [];
    const existing = await env.DB.prepare('SELECT username FROM pupils WHERE class_id = ?').bind(classId).all();
    const taken = new Set((existing.results || []).map((x) => x.username));
    const created = [];
    const skipped = [];

    for (const raw of lines) {
      const line = clean(raw, 100);
      if (!line) continue;
      const [namePart, userPart] = line.split(',').map((s) => s.trim());
      const display = clean(namePart, 40);
      if (!display) continue;

      let username = '';
      if (userPart) {
        const u = userPart.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 20);
        if (u.length >= 3 && !taken.has(u)) username = u;
        else {
          skipped.push({ line, reason: u.length < 3 ? 'username too short' : 'username already used' });
          continue;
        }
      } else {
        const base = usernameBase(display);
        for (let i = 0; i < 40 && !username; i++) {
          const digits = i < 30 ? 10 + Math.floor(Math.random() * 90) : 100 + Math.floor(Math.random() * 900);
          const cand = `${base}${digits}`;
          if (!taken.has(cand)) username = cand;
        }
        if (!username) {
          skipped.push({ line, reason: 'could not generate a username' });
          continue;
        }
      }
      taken.add(username);
      await env.DB.prepare('INSERT INTO pupils (class_id, username, display_name, created_at) VALUES (?, ?, ?, ?)')
        .bind(classId, username, display, Date.now())
        .run();
      created.push({ displayName: display, username });
    }
    return json({ created, skipped });
  }
  m = r.match(/^pupils\/(\d+)$/);
  if (m && method === 'DELETE') {
    await env.DB.prepare('DELETE FROM pupils WHERE id = ?').bind(Number(m[1])).run();
    return json({ ok: true });
  }
  m = r.match(/^pupils\/(\d+)\/reset-xp$/);
  if (m && method === 'POST') {
    const id = Number(m[1]);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM awards WHERE pupil_id = ?').bind(id),
      env.DB.prepare('UPDATE pupils SET xp = 0 WHERE id = ?').bind(id),
    ]);
    return json({ ok: true });
  }

  /* ---- submissions ---- */
  if (method === 'GET' && r === 'submissions') {
    const where = [];
    const binds = [];
    const classId = Number(url.searchParams.get('classId'));
    const kind = url.searchParams.get('kind');
    const status = url.searchParams.get('status');
    if (classId) { where.push('p.class_id = ?'); binds.push(classId); }
    if (kind === 'substantive' || kind === 'rebuttal') { where.push('s.kind = ?'); binds.push(kind); }
    if (status === 'submitted' || status === 'reviewed') { where.push('s.status = ?'); binds.push(status); }
    const rows = await env.DB.prepare(
      `SELECT s.id, s.kind, s.motion, s.side, s.status, s.stars, s.created_at,
              p.display_name, p.username, c.name AS class_name
       FROM submissions s
       JOIN pupils p ON p.id = s.pupil_id
       JOIN classes c ON c.id = p.class_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY s.id DESC LIMIT 300`
    )
      .bind(...binds)
      .all();
    return json({ submissions: rows.results || [] });
  }
  m = r.match(/^submissions\/(\d+)$/);
  if (m && method === 'GET') {
    const row = await env.DB.prepare(
      `SELECT s.*, p.display_name, p.username, c.name AS class_name
       FROM submissions s JOIN pupils p ON p.id = s.pupil_id JOIN classes c ON c.id = p.class_id
       WHERE s.id = ?`
    )
      .bind(Number(m[1]))
      .first();
    if (!row) return fail(404, 'Not found.');
    return json({ submission: { ...row, payload: safeParse(row.payload) } });
  }
  if (m && method === 'PATCH') {
    const id = Number(m[1]);
    const sub = await env.DB.prepare('SELECT id, pupil_id FROM submissions WHERE id = ?').bind(id).first();
    if (!sub) return fail(404, 'Not found.');
    const feedback = clean(body.feedback, 1500);
    const stars = Math.max(0, Math.min(4, Math.floor(Number(body.stars) || 0)));
    const status = feedback || stars ? 'reviewed' : 'submitted';
    await env.DB.prepare('UPDATE submissions SET feedback = ?, stars = ?, status = ?, reviewed_at = ? WHERE id = ?')
      .bind(feedback || null, stars || null, status, Date.now(), id)
      .run();

    // Teacher stars -> XP. Re-grading adjusts the difference rather than double-paying.
    const key = `review:${id}`;
    const newXp = stars * REVIEW_XP_PER_STAR;
    const prev = await env.DB.prepare('SELECT xp FROM awards WHERE pupil_id = ? AND key = ?')
      .bind(sub.pupil_id, key)
      .first();
    const oldXp = prev?.xp || 0;
    if (newXp !== oldXp) {
      if (prev) {
        await env.DB.prepare('UPDATE awards SET xp = ? WHERE pupil_id = ? AND key = ?').bind(newXp, sub.pupil_id, key).run();
      } else {
        await env.DB.prepare('INSERT INTO awards (pupil_id, key, kind, xp, created_at) VALUES (?, ?, ?, ?, ?)')
          .bind(sub.pupil_id, key, 'review', newXp, Date.now())
          .run();
      }
      await env.DB.prepare('UPDATE pupils SET xp = MAX(0, xp + ?) WHERE id = ?').bind(newXp - oldXp, sub.pupil_id).run();
    }
    return json({ ok: true, status });
  }
  if (m && method === 'DELETE') {
    await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(Number(m[1])).run();
    return json({ ok: true });
  }

  /* ---- custom motions ---- */
  if (method === 'GET' && r === 'motions') {
    const rows = await env.DB.prepare(
      `SELECT m.id, m.text, m.kind, m.hint, m.class_id, c.name AS class_name
       FROM motions m LEFT JOIN classes c ON c.id = m.class_id ORDER BY m.id DESC LIMIT 200`
    ).all();
    return json({ motions: rows.results || [] });
  }
  if (method === 'POST' && r === 'motions') {
    const text = clean(body.text, 300);
    if (text.length < 8) return fail(400, 'Write the motion out in full.');
    const kind = body.kind === 'opinion' ? 'opinion' : 'policy';
    const hint = clean(body.hint, 400) || null;
    const classId = body.classId ? Number(body.classId) : null;
    if (classId) {
      const c = await env.DB.prepare('SELECT id FROM classes WHERE id = ?').bind(classId).first();
      if (!c) return fail(400, 'Class not found.');
    }
    const res = await env.DB.prepare('INSERT INTO motions (text, kind, hint, class_id, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(text, kind, hint, classId || null, Date.now())
      .run();
    return json({ id: res.meta.last_row_id });
  }
  m = r.match(/^motions\/(\d+)$/);
  if (m && method === 'DELETE') {
    await env.DB.prepare('DELETE FROM motions WHERE id = ?').bind(Number(m[1])).run();
    return json({ ok: true });
  }

  return fail(404, 'Not found.');
}
