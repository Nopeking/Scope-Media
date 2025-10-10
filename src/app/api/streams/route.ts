import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'streams.json');

// Default streams data (fallback for Netlify/serverless)
const DEFAULT_STREAMS: any[] = [];

// In-memory storage for serverless environments
let memoryStreams: any[] = [...DEFAULT_STREAMS];

// Ensure data directory exists (only works on writable filesystems)
function ensureDataDir() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_STREAMS, null, 2));
    }
    return true;
  } catch (error) {
    console.log('⚠️  Running in serverless environment (read-only filesystem)');
    return false;
  }
}

// GET - Fetch all streams
export async function GET() {
  try {
    console.log('📥 Fetching streams...');
    
    // Try to read from file first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const streams = JSON.parse(data);
        console.log(`✅ Fetched ${streams.length} streams from file`);
        return NextResponse.json(streams);
      } catch (fileError) {
        console.log('⚠️  Could not read file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    console.log(`✅ Fetched ${memoryStreams.length} streams from memory`);
    return NextResponse.json(memoryStreams);
  } catch (error: any) {
    console.error('❌ Error reading streams:', error);
    return NextResponse.json(DEFAULT_STREAMS, { status: 200 });
  }
}

// POST - Add a new stream
export async function POST(request: NextRequest) {
  try {
    const newStream = await request.json();
    console.log('📝 Adding new stream:', newStream.title);
    
    // Try file system first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const streams = JSON.parse(data);
        streams.push(newStream);
        fs.writeFileSync(DB_PATH, JSON.stringify(streams, null, 2));
        console.log('✅ Stream added to file successfully');
        return NextResponse.json(newStream, { status: 201 });
      } catch (fileError) {
        console.log('⚠️  Could not write to file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    memoryStreams.push(newStream);
    console.log('✅ Stream added to memory (temporary - will not persist)');
    return NextResponse.json(newStream, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding stream:', error);
    return NextResponse.json({ error: 'Failed to add stream' }, { status: 500 });
  }
}

// DELETE - Delete a stream
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting stream:', id);
    
    // Try file system first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const streams = JSON.parse(data);
        const filteredStreams = streams.filter((stream: any) => stream.id !== id);
        fs.writeFileSync(DB_PATH, JSON.stringify(filteredStreams, null, 2));
        console.log('✅ Stream deleted from file successfully');
        return NextResponse.json({ success: true });
      } catch (fileError) {
        console.log('⚠️  Could not write to file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    memoryStreams = memoryStreams.filter((stream: any) => stream.id !== id);
    console.log('✅ Stream deleted from memory (temporary)');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting stream:', error);
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
  }
}
