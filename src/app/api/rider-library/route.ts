import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Fetch rider library items
// Can pass riderId or userId (will fetch all library for linked riders)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get('riderId');
    const userId = searchParams.get('userId');

    console.log(`📥 Fetching rider library... riderId: ${riderId}, userId: ${userId}`);

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, returning empty array');
      return NextResponse.json([]);
    }

    let riderIds: string[] = [];

    if (riderId) {
      // Fetch library for specific rider
      riderIds = [riderId];
    } else if (userId) {
      // Fetch all riders linked to this user
      const { data: userRiders, error: userRidersError } = await supabaseAdmin
        .from('user_riders')
        .select('rider_id')
        .eq('user_id', userId);

      if (userRidersError) {
        console.error('❌ Error fetching user riders:', userRidersError);
        return NextResponse.json({ error: 'Failed to fetch user riders' }, { status: 500 });
      }

      riderIds = userRiders?.map(ur => ur.rider_id) || [];
      console.log(`Found ${riderIds.length} linked riders for user ${userId}`);
    } else {
      return NextResponse.json({ error: 'riderId or userId is required' }, { status: 400 });
    }

    if (riderIds.length === 0) {
      console.log('No riders found, returning empty array');
      return NextResponse.json([]);
    }

    // Fetch library items for these riders
    const { data: libraryItems, error } = await supabaseAdmin
      .from('rider_library')
      .select('*')
      .in('rider_id', riderIds)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching rider library:', error);
      return NextResponse.json({ error: 'Failed to fetch rider library' }, { status: 500 });
    }

    console.log(`✅ Fetched ${libraryItems?.length || 0} library items`);
    return NextResponse.json(libraryItems || []);
  } catch (error: any) {
    console.error('❌ Error in rider library GET:', error);
    return NextResponse.json({ error: 'Failed to fetch rider library' }, { status: 500 });
  }
}

// POST - Add a new library item for a rider (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const body = await request.json();
    const {
      rider_id,
      title,
      description,
      content_type,
      file_url,
      thumbnail_url,
      file_size,
      duration,
      tags,
      is_public,
      uploaded_by_admin,
      metadata
    } = body;

    if (!rider_id || !title || !file_url || !content_type) {
      return NextResponse.json(
        { error: 'rider_id, title, file_url, and content_type are required' },
        { status: 400 }
      );
    }

    console.log(`📝 Adding library item for rider ${rider_id}: ${title}`);

    const { data: libraryItem, error } = await supabaseAdmin
      .from('rider_library')
      .insert({
        rider_id,
        title,
        description,
        content_type,
        file_url,
        thumbnail_url,
        file_size,
        duration,
        tags,
        is_public: is_public || false,
        uploaded_by_admin,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding library item:', error);
      return NextResponse.json({ error: 'Failed to add library item' }, { status: 500 });
    }

    console.log(`✅ Library item added successfully`);
    return NextResponse.json(libraryItem);
  } catch (error: any) {
    console.error('❌ Error in rider library POST:', error);
    return NextResponse.json({ error: 'Failed to add library item' }, { status: 500 });
  }
}

// DELETE - Delete a library item (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Library item ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    console.log(`🗑️ Deleting library item ${id}`);

    const { error } = await supabaseAdmin
      .from('rider_library')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting library item:', error);
      return NextResponse.json({ error: 'Failed to delete library item' }, { status: 500 });
    }

    console.log(`✅ Library item deleted successfully`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error in rider library DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete library item' }, { status: 500 });
  }
}
