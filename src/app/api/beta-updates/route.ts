import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'beta-updates.json');

interface BetaSubscriber {
  email: string;
  createdAt: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readSubscribers(): Promise<BetaSubscriber[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSubscribers(subscribers: BetaSubscriber[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(subscribers, null, 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email.' }, { status: 400 });
    }

    const subscribers = await readSubscribers();
    if (!subscribers.some((entry) => entry.email === email)) {
      subscribers.push({ email, createdAt: new Date().toISOString() });
      await writeSubscribers(subscribers);
    }

    return NextResponse.json({ ok: true, message: 'Thanks. You are subscribed for beta updates.' });
  } catch {
    return NextResponse.json({ error: 'Unable to subscribe right now.' }, { status: 500 });
  }
}
