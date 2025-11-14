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

// GET - Fetch scores
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const class_id = searchParams.get('class_id');
    const startlist_id = searchParams.get('startlist_id');
    const round_number = searchParams.get('round_number');
    const is_jumpoff = searchParams.get('is_jumpoff');

    let query = supabaseAdmin
      .from('scores')
      .select(`
        *,
        startlist (
          rider_name,
          horse_name,
          rider_id,
          team_name,
          start_order
        )
      `)
      .order('rank', { ascending: true });

    // Apply filters
    if (class_id) {
      query = query.eq('class_id', class_id);
    }
    if (startlist_id) {
      query = query.eq('startlist_id', startlist_id);
    }
    if (round_number) {
      query = query.eq('round_number', parseInt(round_number));
    }
    if (is_jumpoff !== null) {
      query = query.eq('is_jumpoff', is_jumpoff === 'true');
    }

    const { data: scores, error } = await query;

    if (error) {
      console.error('Error fetching scores:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error in GET /api/scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new score
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
      startlist_id,
      class_id,
      round_number,
      time_taken,
      time_faults,
      jumping_faults,
      total_faults,
      points,
      status,
      is_jumpoff,
      qualified_for_jumpoff,
      rank,
      final_time,
      notes,
      scored_by
    } = body;

    // Validate required fields
    if (!startlist_id || !class_id) {
      return NextResponse.json(
        { error: 'startlist_id and class_id are required' },
        { status: 400 }
      );
    }

    const scoreData = {
      startlist_id,
      class_id,
      round_number: round_number || 1,
      time_taken: time_taken || null,
      time_faults: time_faults || 0,
      jumping_faults: jumping_faults || 0,
      total_faults: total_faults || 0,
      points: points || 0,
      status: status || 'pending',
      is_jumpoff: is_jumpoff || false,
      qualified_for_jumpoff: qualified_for_jumpoff || false,
      rank: rank || null,
      final_time: final_time || null,
      notes: notes || null,
      scored_by: scored_by || null,
      scored_at: status === 'completed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data: score, error } = await supabaseAdmin
      .from('scores')
      .insert(scoreData)
      .select()
      .single();

    if (error) {
      console.error('Error creating score:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a score
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Score id is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      round_number,
      time_taken,
      time_faults,
      jumping_faults,
      total_faults,
      points,
      status,
      is_jumpoff,
      qualified_for_jumpoff,
      rank,
      final_time,
      notes,
      scored_by
    } = body;

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (round_number !== undefined) updateData.round_number = round_number;
    if (time_taken !== undefined) updateData.time_taken = time_taken;
    if (time_faults !== undefined) updateData.time_faults = time_faults;
    if (jumping_faults !== undefined) updateData.jumping_faults = jumping_faults;
    if (total_faults !== undefined) updateData.total_faults = total_faults;
    if (points !== undefined) updateData.points = points;
    if (status !== undefined) {
      updateData.status = status;
      // Set scored_at when status changes to completed
      if (status === 'completed') {
        updateData.scored_at = new Date().toISOString();
      }
    }
    if (is_jumpoff !== undefined) updateData.is_jumpoff = is_jumpoff;
    if (qualified_for_jumpoff !== undefined) updateData.qualified_for_jumpoff = qualified_for_jumpoff;
    if (rank !== undefined) updateData.rank = rank;
    if (final_time !== undefined) updateData.final_time = final_time;
    if (notes !== undefined) updateData.notes = notes;
    if (scored_by !== undefined) updateData.scored_by = scored_by;

    const { data: score, error } = await supabaseAdmin
      .from('scores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating score:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(score);
  } catch (error) {
    console.error('Error in PUT /api/scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
