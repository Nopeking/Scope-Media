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
    console.log('📥 Fetching streams from file database...');
    ensureDataDir();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const streams = JSON.parse(data);
    console.log(`✅ Fetched ${streams.length} streams`);
    return NextResponse.json(streams);
  } catch (error: any) {
    console.error('❌ Error reading streams:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Add a new stream
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    const newStream = await request.json();
    console.log('📝 Adding new stream:', newStream.title);
    
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const streams = JSON.parse(data);
    
    streams.push(newStream);
    fs.writeFileSync(DB_PATH, JSON.stringify(streams, null, 2));
    console.log('✅ Stream added successfully');
    
    return NextResponse.json(newStream, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding stream:', error);
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
    
    console.log('🗑️ Deleting stream:', id);
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const streams = JSON.parse(data);
    const filteredStreams = streams.filter((stream: any) => stream.id !== id);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(filteredStreams, null, 2));
    console.log('✅ Stream deleted successfully');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting stream:', error);
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
  }
}
