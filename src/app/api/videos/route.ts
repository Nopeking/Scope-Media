import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ArchivedVideoInsert, ArchivedVideoUpdate } from '@/types';
import fs from 'fs';
import path from 'path';

// GET - Fetch all videos
export async function GET() {
  try {
    console.log('📥 Fetching videos...');
    
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, falling back to file-based data');
      return getVideosFromFile();
    }
    
        const { data: videos, error } = await supabaseAdmin
      .from('archived_videos')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }

    // Map database snake_case to frontend camelCase
    const mappedVideos = videos?.map(video => {
      // Create month string from upload_date
      const uploadDate = new Date(video.upload_date);
      const month = uploadDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      return {
        id: video.id,
        title: video.title,
        url: video.url,
        duration: video.duration,
        uploadDate: video.upload_date,
        customTitle: video.custom_title, // Map custom_title to customTitle
        thumbnail: video.thumbnail,
        month: month // Add month property
      };
    }) || [];

    console.log(`✅ Fetched ${mappedVideos.length} videos from Supabase`);
    return NextResponse.json(mappedVideos);
  } catch (error: any) {
    console.error('❌ Error reading videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST - Add a new video
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, using file-based storage');
      return addVideoToFile(request);
    }

    const newVideo = await request.json();
    console.log('📝 Adding new video:', newVideo.title);
    
    // Map frontend camelCase to database snake_case
    const videoData: ArchivedVideoInsert = {
      title: newVideo.title,
      url: newVideo.url,
      duration: newVideo.duration || null,
      custom_title: newVideo.customTitle, // Map customTitle to custom_title
      thumbnail: newVideo.thumbnail || null
    };
    
        const { data: video, error } = await supabaseAdmin
      .from('archived_videos')
      .insert(videoData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding video:', error);
      return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
    }

    console.log('✅ Video added to Supabase successfully');
    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding video:', error);
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
  }
}

// DELETE - Delete a video
export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, using file-based storage');
      return deleteVideoFromFile(request);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting video:', id);
    
    const { error } = await supabaseAdmin
      .from('archived_videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting video:', error);
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
    }

    console.log('✅ Video deleted from Supabase successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}

// File-based fallback functions
async function getVideosFromFile() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'videos.json');
    
    if (!fs.existsSync(dataPath)) {
      console.log('📁 videos.json not found, creating empty file');
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
      return NextResponse.json([]);
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    const videos = JSON.parse(data);
    
    console.log(`✅ Fetched ${videos.length} videos from file system`);
    return NextResponse.json(videos);
  } catch (error) {
    console.error('❌ Error reading videos from file:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

async function saveVideosToFile(videos: any[]) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'videos.json');
    const dataDir = path.dirname(dataPath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(videos, null, 2));
    console.log('✅ Videos saved to file system');
    return true;
  } catch (error) {
    console.error('❌ Error saving videos to file:', error);
    return false;
  }
}

async function addVideoToFile(request: NextRequest) {
  try {
    const newVideo = await request.json();
    console.log('📝 Adding new video to file:', newVideo.title);
    
    const dataPath = path.join(process.cwd(), 'data', 'videos.json');
    const dataDir = path.dirname(dataPath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let videos = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      videos = JSON.parse(data);
    }
    
    // Generate ID and add video
    const videoWithId = {
      id: Date.now().toString(),
      ...newVideo,
      uploadDate: newVideo.uploadDate || new Date().toISOString(),
      month: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    };
    
    videos.push(videoWithId);
    await saveVideosToFile(videos);
    
    console.log('✅ Video added to file system successfully');
    return NextResponse.json(videoWithId, { status: 201 });
  } catch (error) {
    console.error('❌ Error adding video to file:', error);
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
  }
}

async function deleteVideoFromFile(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting video from file:', id);
    
    const dataPath = path.join(process.cwd(), 'data', 'videos.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    const videos = JSON.parse(data);
    
    const filteredVideos = videos.filter((video: any) => video.id !== id);
    
    if (filteredVideos.length === videos.length) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    
    await saveVideosToFile(filteredVideos);
    
    console.log('✅ Video deleted from file system successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting video from file:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
