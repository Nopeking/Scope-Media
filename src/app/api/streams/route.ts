import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { StreamInsert, StreamUpdate } from '@/types';
import fs from 'fs';
import path from 'path';

// GET - Fetch all streams
export async function GET() {
  try {
    console.log('📥 Fetching streams...');
    
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, falling back to file-based data');
      return getStreamsFromFile();
    }
    
        const { data: streams, error } = await supabaseAdmin
      .from('streams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching streams:', error);
      return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
    }

    console.log(`✅ Fetched ${streams?.length || 0} streams from Supabase`);
    return NextResponse.json(streams || []);
  } catch (error: any) {
    console.error('❌ Error reading streams:', error);
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}

// POST - Add a new stream
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, using file-based storage');
      return addStreamToFile(request);
    }

    const newStream: StreamInsert = await request.json();
    console.log('📝 Adding new stream:', newStream.title);
    
        const { data: stream, error } = await supabaseAdmin
      .from('streams')
      .insert(newStream)
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding stream:', error);
      return NextResponse.json({ error: 'Failed to add stream' }, { status: 500 });
    }

    console.log('✅ Stream added to Supabase successfully');
    return NextResponse.json(stream, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding stream:', error);
    return NextResponse.json({ error: 'Failed to add stream' }, { status: 500 });
  }
}

// DELETE - Delete a stream
export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, using file-based storage');
      return deleteStreamFromFile(request);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting stream:', id);
    
    const { error } = await supabaseAdmin
      .from('streams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting stream:', error);
      return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
    }

    console.log('✅ Stream deleted from Supabase successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting stream:', error);
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
  }
}

// File-based fallback functions
async function getStreamsFromFile() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'streams.json');
    
    if (!fs.existsSync(dataPath)) {
      console.log('📁 streams.json not found, creating empty file');
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
      return NextResponse.json([]);
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    const streams = JSON.parse(data);
    
    console.log(`✅ Fetched ${streams.length} streams from file system`);
    return NextResponse.json(streams);
  } catch (error) {
    console.error('❌ Error reading streams from file:', error);
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}

async function addStreamToFile(request: NextRequest) {
  try {
    const newStream = await request.json();
    console.log('📝 Adding new stream to file:', newStream.title);
    
    const dataPath = path.join(process.cwd(), 'data', 'streams.json');
    const dataDir = path.dirname(dataPath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let streams = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      streams = JSON.parse(data);
    }
    
    // Generate ID and add stream
    const streamWithId = {
      id: Date.now().toString(),
      ...newStream,
      status: newStream.status || 'inactive',
      viewers: newStream.viewers || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    streams.push(streamWithId);
    await saveStreamsToFile(streams);
    
    console.log('✅ Stream added to file system successfully');
    return NextResponse.json(streamWithId, { status: 201 });
  } catch (error) {
    console.error('❌ Error adding stream to file:', error);
    return NextResponse.json({ error: 'Failed to add stream' }, { status: 500 });
  }
}

async function deleteStreamFromFile(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting stream from file:', id);
    
    const dataPath = path.join(process.cwd(), 'data', 'streams.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: 'No streams found' }, { status: 404 });
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    const streams = JSON.parse(data);
    
    const filteredStreams = streams.filter((stream: any) => stream.id !== id);
    
    if (filteredStreams.length === streams.length) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }
    
    await saveStreamsToFile(filteredStreams);
    
    console.log('✅ Stream deleted from file system successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting stream from file:', error);
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
  }
}

async function saveStreamsToFile(streams: any[]) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'streams.json');
    const dataDir = path.dirname(dataPath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(streams, null, 2));
    console.log('✅ Streams saved to file system');
    return true;
  } catch (error) {
    console.error('❌ Error saving streams to file:', error);
    return false;
  }
}
