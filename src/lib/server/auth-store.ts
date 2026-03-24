import 'server-only';

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'auth-db.json');
const SESSION_COOKIE = 'onekey_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface StoredSession {
  id: string;
  userId: string;
  expiresAt: number;
}

interface AuthDatabase {
  users: StoredUser[];
  sessions: StoredSession[];
  bookmarks: Record<string, string[]>;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

const EMPTY_DB: AuthDatabase = {
  users: [],
  sessions: [],
  bookmarks: {},
};

async function ensureDb() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), 'utf8');
  }
}

async function readDb(): Promise<AuthDatabase> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  const parsed = JSON.parse(raw) as AuthDatabase;
  return {
    users: parsed.users ?? [],
    sessions: parsed.sessions ?? [],
    bookmarks: parsed.bookmarks ?? {},
  };
}

async function writeDb(db: AuthDatabase) {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function sanitizeUser(user: StoredUser): SessionUser {
  return { id: user.id, name: user.name, email: user.email };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const stored = Buffer.from(key, 'hex');
  if (stored.length !== derived.length) return false;
  return timingSafeEqual(stored, derived);
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function pruneExpiredSessions(db: AuthDatabase) {
  const now = Date.now();
  db.sessions = db.sessions.filter((session) => session.expiresAt > now);
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const db = await readDb();
  pruneExpiredSessions(db);

  const email = input.email.trim().toLowerCase();
  if (db.users.some((user) => user.email === email)) {
    throw new Error('An account with that email already exists.');
  }

  const user: StoredUser = {
    id: randomBytes(12).toString('hex'),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  db.bookmarks[user.id] = [];
  await writeDb(db);
  return sanitizeUser(user);
}

export async function authenticateUser(input: { email: string; password: string }) {
  const db = await readDb();
  pruneExpiredSessions(db);

  const email = input.email.trim().toLowerCase();
  const user = db.users.find((entry) => entry.email === email);
  if (!user) throw new Error('Invalid email or password.');

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new Error('Invalid email or password.');

  await writeDb(db);
  return sanitizeUser(user);
}

export async function createSession(userId: string) {
  const db = await readDb();
  pruneExpiredSessions(db);

  const rawToken = randomBytes(32).toString('hex');
  db.sessions.push({
    id: hashSessionToken(rawToken),
    userId,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  });

  await writeDb(db);
  return rawToken;
}

export async function deleteSession(rawToken?: string) {
  if (!rawToken) return;
  const db = await readDb();
  pruneExpiredSessions(db);
  const hashed = hashSessionToken(rawToken);
  db.sessions = db.sessions.filter((session) => session.id !== hashed);
  await writeDb(db);
}

export async function getSessionUser(rawToken?: string | null) {
  if (!rawToken) return null;
  const db = await readDb();
  pruneExpiredSessions(db);
  const hashed = hashSessionToken(rawToken);
  const session = db.sessions.find((entry) => entry.id === hashed);
  if (!session) {
    await writeDb(db);
    return null;
  }

  const user = db.users.find((entry) => entry.id === session.userId);
  await writeDb(db);
  return user ? sanitizeUser(user) : null;
}

export async function getBookmarksForUser(userId: string) {
  const db = await readDb();
  return db.bookmarks[userId] ?? [];
}

export async function toggleBookmarkForUser(userId: string, apiId: string) {
  const db = await readDb();
  const existing = db.bookmarks[userId] ?? [];
  const added = !existing.includes(apiId);
  const bookmarks = added ? [...existing, apiId] : existing.filter((id) => id !== apiId);
  db.bookmarks[userId] = bookmarks;
  await writeDb(db);
  return { bookmarks, added };
}

export const authCookie = {
  name: SESSION_COOKIE,
  maxAge: SESSION_MAX_AGE,
};
