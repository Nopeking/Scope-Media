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

// GET - Fetch all flags or a specific flag by country_code
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const country_code = searchParams.get('country_code');

    let query = supabaseAdmin
      .from('flags')
      .select('*')
      .order('country_code', { ascending: true });

    if (country_code) {
      query = query.eq('country_code', country_code);
    }

    const { data: flags, error } = await query;

    if (error) {
      console.error('Error fetching flags:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(country_code ? (flags[0] || null) : flags);
  } catch (error) {
    console.error('Error in GET /api/flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new flag
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { country_code, flag_url } = body;

    if (!country_code || !flag_url) {
      return NextResponse.json(
        { error: 'country_code and flag_url are required' },
        { status: 400 }
      );
    }

    // Validate country_code format (should be 3 uppercase letters)
    if (!/^[A-Z]{3}$/.test(country_code)) {
      return NextResponse.json(
        { error: 'country_code must be 3 uppercase letters (e.g., "JOR", "UAE")' },
        { status: 400 }
      );
    }

    const { data: flag, error } = await supabaseAdmin
      .from('flags')
      .insert({
        country_code: country_code.toUpperCase(),
        flag_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating flag:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(flag, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing flag
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { country_code, flag_url } = body;

    if (!country_code) {
      return NextResponse.json(
        { error: 'country_code is required' },
        { status: 400 }
      );
    }

    if (!flag_url) {
      return NextResponse.json(
        { error: 'flag_url is required' },
        { status: 400 }
      );
    }

    const { data: flag, error } = await supabaseAdmin
      .from('flags')
      .update({
        flag_url,
        updated_at: new Date().toISOString()
      })
      .eq('country_code', country_code.toUpperCase())
      .select()
      .single();

    if (error) {
      console.error('Error updating flag:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!flag) {
      return NextResponse.json(
        { error: 'Flag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error in PUT /api/flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a flag
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const country_code = searchParams.get('country_code');

    if (!country_code) {
      return NextResponse.json(
        { error: 'country_code is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('flags')
      .delete()
      .eq('country_code', country_code.toUpperCase());

    if (error) {
      console.error('Error deleting flag:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

