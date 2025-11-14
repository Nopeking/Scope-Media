import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

if (supabaseUrl && supabaseKey) {
  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// GET - Fetch a single show by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { id } = await params;

    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .select('*, classes(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching show:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    return NextResponse.json(show);
  } catch (error) {
    console.error('Error in GET /api/shows/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a show
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      start_date,
      end_date,
      show_type,
      location,
      description,
      status
    } = body;

    // Validate show_type if provided
    if (show_type && !['national', 'international'].includes(show_type)) {
      return NextResponse.json(
        { error: 'show_type must be either "national" or "international"' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (show_type !== undefined) updateData.show_type = show_type;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating show:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(show);
  } catch (error) {
    console.error('Error in PUT /api/shows/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a show
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('shows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting show:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/shows/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
