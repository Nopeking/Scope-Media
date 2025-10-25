import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CustomTitleInsert, CustomTitleUpdate } from '@/types';

// GET - Fetch all custom titles
export async function GET() {
  try {
    console.log('📥 Fetching custom titles...');
    
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, returning empty array');
      return NextResponse.json([]);
    }
    
        const { data: titles, error } = await supabaseAdmin
      .from('custom_titles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching titles:', error);
      return NextResponse.json({ error: 'Failed to fetch titles' }, { status: 500 });
    }

    // Extract just the title strings for backward compatibility
    const titleStrings = titles?.map(t => t.title) || [];
    console.log(`✅ Fetched ${titleStrings.length} custom titles from Supabase`);
    return NextResponse.json(titleStrings);
  } catch (error: any) {
    console.error('❌ Error reading titles:', error);
    return NextResponse.json({ error: 'Failed to fetch titles' }, { status: 500 });
  }
}

// POST - Add a new title
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { title } = await request.json();
    console.log('📝 Adding new custom title:', title);
    
    const { data: newTitle, error } = await supabaseAdmin
      .from('custom_titles')
      .insert({ title })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding title:', error);
      return NextResponse.json({ error: 'Failed to add title' }, { status: 500 });
    }

    console.log('✅ Custom title added to Supabase successfully');
    
    // Return all titles for backward compatibility
    const { data: allTitles } = await supabaseAdmin
      .from('custom_titles')
      .select('title')
      .order('created_at', { ascending: false });
    
    const titleStrings = allTitles?.map(t => t.title) || [];
    return NextResponse.json(titleStrings, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding title:', error);
    return NextResponse.json({ error: 'Failed to add title' }, { status: 500 });
  }
}

// DELETE - Delete a title
export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting custom title:', title);
    
    const { error } = await supabaseAdmin
      .from('custom_titles')
      .delete()
      .eq('title', title);

    if (error) {
      console.error('❌ Error deleting title:', error);
      return NextResponse.json({ error: 'Failed to delete title' }, { status: 500 });
    }

    console.log('✅ Custom title deleted from Supabase successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting title:', error);
    return NextResponse.json({ error: 'Failed to delete title' }, { status: 500 });
  }
}
