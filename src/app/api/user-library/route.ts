import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { UserLibraryItemInsert, UserLibraryItemUpdate } from '@/types';

// GET - Fetch user library items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📥 Fetching user library items for user:', userId);

    const { data: libraryItems, error } = await getSupabaseAdmin()
      .from('user_library')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user library:', error);
      return NextResponse.json({ error: 'Failed to fetch user library' }, { status: 500 });
    }

    console.log(`✅ Fetched ${libraryItems?.length || 0} library items for user ${userId}`);
    return NextResponse.json(libraryItems || []);
  } catch (error: any) {
    console.error('❌ Error in user library GET:', error);
    return NextResponse.json({ error: 'Failed to fetch user library' }, { status: 500 });
  }
}

// POST - Add new library item
export async function POST(request: NextRequest) {
  try {
    const newItem = await request.json();
    console.log('📝 Adding new library item:', newItem.title);

    // Validate required fields
    if (!newItem.user_id || !newItem.title || !newItem.content_type || !newItem.file_url) {
      return NextResponse.json({ 
        error: 'Missing required fields: user_id, title, content_type, file_url' 
      }, { status: 400 });
    }

    const libraryItemData: UserLibraryItemInsert = {
      user_id: newItem.user_id,
      title: newItem.title,
      description: newItem.description || null,
      content_type: newItem.content_type,
      file_url: newItem.file_url,
      thumbnail_url: newItem.thumbnail_url || null,
      file_size: newItem.file_size || null,
      duration: newItem.duration || null,
      tags: newItem.tags || null,
      is_public: newItem.is_public || false,
      uploaded_by_admin: newItem.uploaded_by_admin || false,
      admin_uploader_id: newItem.admin_uploader_id || null,
    };

    const { data: libraryItem, error } = await getSupabaseAdmin()
      .from('user_library')
      .insert(libraryItemData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding library item:', error);
      return NextResponse.json({ error: 'Failed to add library item' }, { status: 500 });
    }

    console.log('✅ Library item added successfully');
    return NextResponse.json(libraryItem, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding library item:', error);
    return NextResponse.json({ error: 'Failed to add library item' }, { status: 500 });
  }
}

// PUT - Update library item
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const updates = await request.json();
    console.log('📝 Updating library item:', itemId);

    const { data: libraryItem, error } = await getSupabaseAdmin()
      .from('user_library')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating library item:', error);
      return NextResponse.json({ error: 'Failed to update library item' }, { status: 500 });
    }

    console.log('✅ Library item updated successfully');
    return NextResponse.json(libraryItem);
  } catch (error: any) {
    console.error('❌ Error updating library item:', error);
    return NextResponse.json({ error: 'Failed to update library item' }, { status: 500 });
  }
}

// DELETE - Delete library item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting library item:', itemId);

    const { error } = await getSupabaseAdmin()
      .from('user_library')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('❌ Error deleting library item:', error);
      return NextResponse.json({ error: 'Failed to delete library item' }, { status: 500 });
    }

    console.log('✅ Library item deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting library item:', error);
    return NextResponse.json({ error: 'Failed to delete library item' }, { status: 500 });
  }
}
