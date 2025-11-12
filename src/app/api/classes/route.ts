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

// GET - Fetch classes
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const show_id = searchParams.get('show_id');
    const status = searchParams.get('status');
    const class_rule = searchParams.get('class_rule');

    let query = supabaseAdmin
      .from('classes')
      .select('*, shows(name, show_type)')
      .order('class_date', { ascending: true });

    // Apply filters
    if (show_id) {
      query = query.eq('show_id', show_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (class_rule) {
      query = query.eq('class_rule', class_rule);
    }

    const { data: classes, error } = await query;

    if (error) {
      console.error('Error fetching classes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error in GET /api/classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new class
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
      show_id,
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

    // Validate required fields
    if (!show_id || !class_name || !class_rule) {
      return NextResponse.json(
        { error: 'show_id, class_name, and class_rule are required' },
        { status: 400 }
      );
    }

    // Validate class_rule
    if (!VALID_CLASS_RULES.includes(class_rule)) {
      return NextResponse.json(
        { error: `Invalid class_rule. Must be one of: ${VALID_CLASS_RULES.join(', ')}` },
        { status: 400 }
      );
    }

    const classData = {
      show_id,
      class_name,
      class_rule,
      class_type: class_type || null,
      height: height || null,
      price: price || null,
      currency: currency || 'AED',
      class_date: class_date || null,
      start_time: start_time || null,
      time_allowed: time_allowed || null,
      time_allowed_round2: time_allowed_round2 || null,
      optimum_time: optimum_time || null,
      max_points: max_points || 65,
      number_of_rounds: number_of_rounds || 1,
      linked_stream_id: linked_stream_id || null,
      status: status || 'upcoming',
      updated_at: new Date().toISOString()
    };

    const { data: classItem, error } = await supabaseAdmin
      .from('classes')
      .insert(classData)
      .select()
      .single();

    if (error) {
      console.error('Error creating class:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(classItem, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
