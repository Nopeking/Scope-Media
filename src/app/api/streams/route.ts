import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'streams.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
}

// GET - Fetch all streams
export async function GET() {
  try {
    ensureDataDir();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const streams = JSON.parse(data);
    return NextResponse.json(streams);
  } catch (error) {
    console.error('Error reading streams:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Add a new stream
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    const newStream = await request.json();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const streams = JSON.parse(data);
    
    streams.push(newStream);
    fs.writeFileSync(DB_PATH, JSON.stringify(streams, null, 2));
    
    return NextResponse.json(newStream, { status: 201 });
  } catch (error) {
    console.error('Error adding stream:', error);
    return NextResponse.json({ error: 'Failed to add stream' }, { status: 500 });
  }
}

// DELETE - Delete a stream
export async function DELETE(request: NextRequest) {
  try {
    ensureDataDir();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const streams = JSON.parse(data);
    const filteredStreams = streams.filter((stream: any) => stream.id !== id);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(filteredStreams, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stream:', error);
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
  }
}

