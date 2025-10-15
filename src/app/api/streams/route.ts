import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { StreamInsert, StreamUpdate } from '@/types';

// GET - Fetch all streams
export async function GET() {
  try {
    console.log('📥 Fetching streams...');
    
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, returning empty array');
      return NextResponse.json([]);
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
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
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
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
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
