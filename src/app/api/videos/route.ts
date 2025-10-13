import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ArchivedVideoInsert, ArchivedVideoUpdate } from '@/types';

// GET - Fetch all videos
export async function GET() {
  try {
    console.log('📥 Fetching videos...');
    
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
