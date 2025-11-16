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

// GET - Fetch startlist entries
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
    const rider_id = searchParams.get('rider_id');

    let query = supabaseAdmin
      .from('startlist')
      .select('*, classes(class_name, show_id)')
      .order('start_order', { ascending: true });

    // Apply filters
    if (class_id) {
      query = query.eq('class_id', class_id);
    }
    if (rider_id) {
      query = query.eq('rider_id', rider_id);
    }

    const { data: startlist, error } = await query;

    if (error) {
      console.error('Error fetching startlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(startlist);
  } catch (error) {
    console.error('Error in GET /api/startlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create startlist entry(ies) - supports both single and bulk insert
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Check if it's a bulk insert (array) or single insert
    const isBulk = Array.isArray(body);
    const entries = isBulk ? body : [body];

    // Validate required fields for all entries
    for (const entry of entries) {
      const { class_id, rider_name, horse_name, start_order } = entry;

      if (!class_id || !rider_name || !horse_name || start_order === undefined) {
        return NextResponse.json(
          { error: 'class_id, rider_name, horse_name, and start_order are required for all entries' },
          { status: 400 }
        );
      }
    }

    // Prepare data for insertion with country lookup from riders table
    const startlistDataPromises = entries.map(async (entry: any) => {
      let countryCode = entry.country_code || null;
      
      // If FEI ID is provided, lookup country from riders table
      if (entry.fei_id && !countryCode) {
        try {
          const { data: rider } = await supabaseAdmin
            .from('riders')
            .select('country')
            .eq('fei_registration', entry.fei_id)
            .single();
          
          if (rider && rider.country) {
            countryCode = rider.country;
          }
        } catch (error) {
          console.log(`Could not find rider with FEI ID: ${entry.fei_id}`);
        }
      }

      return {
        class_id: entry.class_id,
        rider_name: entry.rider_name,
        rider_id: entry.rider_id || null,
        fei_id: entry.fei_id || null,
        license: entry.license || null,
        horse_name: entry.horse_name,
        horse_id: entry.horse_id || null,
        team_name: entry.team_name || null,
        club_name: entry.club_name || null,
        is_handicap: entry.is_handicap || false,
        country_code: countryCode,
        start_order: entry.start_order,
        updated_at: new Date().toISOString()
      };
    });

    const startlistData = await Promise.all(startlistDataPromises);

    const { data: startlist, error } = await supabaseAdmin
      .from('startlist')
      .insert(startlistData)
      .select();

    if (error) {
      console.error('Error creating startlist entries:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return single object if single insert, array if bulk
    return NextResponse.json(isBulk ? startlist : startlist[0], { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/startlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete startlist entry
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
    const class_id = searchParams.get('class_id');

    // Allow deletion by id or by class_id (to clear entire class startlist)
    if (!id && !class_id) {
      return NextResponse.json(
        { error: 'Either id or class_id is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('startlist').delete();

    if (id) {
      query = query.eq('id', id);
    } else if (class_id) {
      query = query.eq('class_id', class_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting startlist entry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/startlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
