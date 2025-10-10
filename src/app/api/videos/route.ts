import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'videos.json');

// Default video data (fallback for Netlify/serverless)
const DEFAULT_VIDEOS = [
  {
    id: "1728000000000",
    title: "Class 6B Novice",
    url: "https://youtube.com/live/uR2vU5AxZMk",
    thumbnail: "/equestrian-thumbnail.jpg",
    duration: "Live",
    uploadDate: "10/10/2025",
    customTitle: "Emirates Longines League - (Arena 2) Butheeb Equestrian Academy",
    month: "October 2025"
  }
];

// In-memory storage for serverless environments
let memoryVideos: any[] = [...DEFAULT_VIDEOS];

// Ensure data directory exists (only works on writable filesystems)
function ensureDataDir() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_VIDEOS, null, 2));
    }
    return true;
  } catch (error) {
    console.log('⚠️  Running in serverless environment (read-only filesystem)');
    return false;
  }
}

// GET - Fetch all videos
export async function GET() {
  try {
    console.log('📥 Fetching videos...');
    
    // Try to read from file first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const videos = JSON.parse(data);
        console.log(`✅ Fetched ${videos.length} videos from file`);
        return NextResponse.json(videos);
      } catch (fileError) {
        console.log('⚠️  Could not read file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    console.log(`✅ Fetched ${memoryVideos.length} videos from memory`);
    return NextResponse.json(memoryVideos);
  } catch (error: any) {
    console.error('❌ Error reading videos:', error);
    return NextResponse.json(DEFAULT_VIDEOS, { status: 200 });
  }
}

// POST - Add a new video
export async function POST(request: NextRequest) {
  try {
    const newVideo = await request.json();
    console.log('📝 Adding new video:', newVideo.title);
    
    // Try file system first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const videos = JSON.parse(data);
        videos.push(newVideo);
        fs.writeFileSync(DB_PATH, JSON.stringify(videos, null, 2));
        console.log('✅ Video added to file successfully');
        return NextResponse.json(newVideo, { status: 201 });
      } catch (fileError) {
        console.log('⚠️  Could not write to file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    memoryVideos.push(newVideo);
    console.log('✅ Video added to memory (temporary - will not persist)');
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding video:', error);
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
  }
}

// DELETE - Delete a video
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting video:', id);
    
    // Try file system first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const videos = JSON.parse(data);
        const filteredVideos = videos.filter((video: any) => video.id !== id);
        fs.writeFileSync(DB_PATH, JSON.stringify(filteredVideos, null, 2));
        console.log('✅ Video deleted from file successfully');
        return NextResponse.json({ success: true });
      } catch (fileError) {
        console.log('⚠️  Could not write to file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    memoryVideos = memoryVideos.filter((video: any) => video.id !== id);
    console.log('✅ Video deleted from memory (temporary)');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
