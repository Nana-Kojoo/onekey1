import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ bookmarks: [] });
}

export async function POST() {
  return NextResponse.json({ error: 'Use local bookmarks in the client.' }, { status: 410 });
}
