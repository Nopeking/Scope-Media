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

// GET - Fetch all shows
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const show_type = searchParams.get('show_type');

    let query = supabaseAdmin
      .from('shows')
      .select('*')
      .order('start_date', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (show_type) {
      query = query.eq('show_type', show_type);
    }

    const { data: shows, error } = await query;

    if (error) {
      console.error('Error fetching shows:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Automatically update show statuses based on dates
    if (shows && shows.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const show of shows) {
        if (show.status === 'cancelled') continue;

        const startDate = new Date(show.start_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(show.end_date);
        endDate.setHours(0, 0, 0, 0);

        let newStatus = show.status;

        // Check if show should be ongoing
        if (today >= startDate && today <= endDate && show.status === 'upcoming') {
          newStatus = 'ongoing';
        }
        // Check if show should be completed
        else if (today > endDate && show.status !== 'completed') {
          newStatus = 'completed';
        }

        // Update if status changed
        if (newStatus !== show.status) {
          await supabaseAdmin
            .from('shows')
            .update({
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', show.id);
          
          // Update the show object in the response
          show.status = newStatus;
        }
      }
    }

    return NextResponse.json(shows);
  } catch (error) {
    console.error('Error in GET /api/shows:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new show
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

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

    // Validate required fields
    if (!name || !start_date || !end_date || !show_type) {
      return NextResponse.json(
        { error: 'Name, start_date, end_date, and show_type are required' },
        { status: 400 }
      );
    }

    // Validate show_type
    if (!['national', 'international'].includes(show_type)) {
      return NextResponse.json(
        { error: 'show_type must be either "national" or "international"' },
        { status: 400 }
      );
    }

    const showData = {
      name,
      start_date,
      end_date,
      show_type,
      location: location || null,
      description: description || null,
      status: status || 'upcoming',
      updated_at: new Date().toISOString()
    };

    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .insert(showData)
      .select()
      .single();

    if (error) {
      console.error('Error creating show:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(show, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/shows:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
