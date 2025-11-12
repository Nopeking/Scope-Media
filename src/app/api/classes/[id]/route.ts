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

const VALID_CLASS_RULES = [
  'one_round_against_clock',
  'one_round_not_against_clock',
  'optimum_time',
  'special_two_phases',
  'two_phases',
  'one_round_with_jumpoff',
  'two_rounds_with_tiebreaker',
  'two_rounds_team_with_tiebreaker',
  'accumulator',
  'speed_and_handiness',
  'six_bars'
];

// GET - Fetch a single class by ID
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

    const { data: classItem, error } = await supabaseAdmin
      .from('classes')
      .select('*, shows(name, show_type), startlist(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching class:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!classItem) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(classItem);
  } catch (error) {
    console.error('Error in GET /api/classes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a class
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
      class_name,
      class_rule,
      class_type,
      height,
      price,
      currency,
      class_date,
      start_time,
      time_allowed,
      time_allowed_round2,
      optimum_time,
      max_points,
      number_of_rounds,
      linked_stream_id,
      status
    } = body;

    // Validate class_rule if provided
    if (class_rule && !VALID_CLASS_RULES.includes(class_rule)) {
      return NextResponse.json(
        { error: `Invalid class_rule. Must be one of: ${VALID_CLASS_RULES.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (class_name !== undefined) updateData.class_name = class_name;
    if (class_rule !== undefined) updateData.class_rule = class_rule;
    if (class_type !== undefined) updateData.class_type = class_type;
    if (height !== undefined) updateData.height = height;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (class_date !== undefined) updateData.class_date = class_date;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (time_allowed !== undefined) updateData.time_allowed = time_allowed;
    if (time_allowed_round2 !== undefined) updateData.time_allowed_round2 = time_allowed_round2;
    if (optimum_time !== undefined) updateData.optimum_time = optimum_time;
    if (max_points !== undefined) updateData.max_points = max_points;
    if (number_of_rounds !== undefined) updateData.number_of_rounds = number_of_rounds;
    if (linked_stream_id !== undefined) updateData.linked_stream_id = linked_stream_id;
    if (status !== undefined) updateData.status = status;

    const { data: classItem, error } = await supabaseAdmin
      .from('classes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating class:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(classItem);
  } catch (error) {
    console.error('Error in PUT /api/classes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a class
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
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting class:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/classes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
