import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'videos.json');

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

// GET - Fetch all videos
export async function GET() {
  try {
    console.log('📥 Fetching videos from file database...');
    ensureDataDir();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const videos = JSON.parse(data);
    console.log(`✅ Fetched ${videos.length} videos`);
    return NextResponse.json(videos);
  } catch (error: any) {
    console.error('❌ Error reading videos:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Add a new video
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    const newVideo = await request.json();
    console.log('📝 Adding new video:', newVideo.title);
    
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const videos = JSON.parse(data);
    
    videos.push(newVideo);
    fs.writeFileSync(DB_PATH, JSON.stringify(videos, null, 2));
    console.log('✅ Video added successfully');
    
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding video:', error);
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
  }
}

// DELETE - Delete a video
export async function DELETE(request: NextRequest) {
  try {
    ensureDataDir();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting video:', id);
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const videos = JSON.parse(data);
    const filteredVideos = videos.filter((video: any) => video.id !== id);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(filteredVideos, null, 2));
    console.log('✅ Video deleted successfully');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
