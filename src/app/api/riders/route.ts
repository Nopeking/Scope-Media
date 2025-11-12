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

// GET - Fetch all riders
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const club = searchParams.get('club');
    const country = searchParams.get('country');
    const licence_year = searchParams.get('licence_year');

    let query = supabaseAdmin
      .from('riders')
      .select('*')
      .order('last_name', { ascending: true });

    // Apply filters
    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }
    if (club) {
      query = query.eq('club_name', club);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (licence_year) {
      query = query.eq('licence_year', parseInt(licence_year));
    }

    const { data: riders, error } = await query;

    if (error) {
      console.error('Error fetching riders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(riders);
  } catch (error) {
    console.error('Error in GET /api/riders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update a rider
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
      external_id,
      licence,
      licence_year,
      first_name,
      last_name,
      full_name,
      email,
      phone,
      address,
      zipcode,
      city,
      address_country,
      country,
      club_id,
      club_name,
      fei_registration,
      profile_image_url,
      is_active,
      metadata
    } = body;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Upsert rider (update if exists, insert if not)
    const riderData = {
      external_id: external_id || null,
      licence: licence || null,
      licence_year: licence_year || null,
      first_name,
      last_name,
      full_name: full_name || `${first_name} ${last_name}`,
      email: email || null,
      phone: phone || null,
      address: address || null,
      zipcode: zipcode || null,
      city: city || null,
      address_country: address_country || null,
      country: country || null,
      club_id: club_id || null,
      club_name: club_name || null,
      fei_registration: fei_registration || null,
      profile_image_url: profile_image_url || null,
      is_active: is_active !== undefined ? is_active : true,
      metadata: metadata || null,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: rider, error } = await supabaseAdmin
      .from('riders')
      .upsert(riderData, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting rider:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(rider, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/riders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a rider
export async function DELETE(request: NextRequest) {
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
        { error: 'Rider ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('riders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting rider:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/riders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
