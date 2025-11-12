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

// POST - Link a rider to the current user by FEI Registration
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fei_registration, user_id } = body;

    if (!fei_registration) {
      return NextResponse.json(
        { error: 'FEI Registration number is required' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`Looking for rider with FEI Registration: ${fei_registration}`);

    // Search for rider by FEI Registration
    const { data: riders, error: searchError } = await supabaseAdmin
      .from('riders')
      .select('*')
      .ilike('fei_registration', fei_registration.trim())
      .limit(1);

    if (searchError) {
      console.error('Error searching for rider:', searchError);
      return NextResponse.json(
        { error: 'Failed to search for rider', details: searchError.message },
        { status: 500 }
      );
    }

    if (!riders || riders.length === 0) {
      return NextResponse.json(
        {
          error: 'No rider found with that FEI Registration number',
          fei_registration
        },
        { status: 404 }
      );
    }

    const rider = riders[0];
    console.log(`Found rider: ${rider.full_name} (${rider.id})`);

    // Check if already linked
    const { data: existingLink, error: checkError } = await supabaseAdmin
      .from('user_riders')
      .select('*')
      .eq('user_id', user_id)
      .eq('rider_id', rider.id)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing link:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing link', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingLink && existingLink.length > 0) {
      return NextResponse.json(
        {
          message: 'Rider already linked to your account',
          rider,
          link: existingLink[0]
        },
        { status: 200 }
      );
    }

    // Create the link
    const { data: link, error: linkError } = await supabaseAdmin
      .from('user_riders')
      .insert({
        user_id,
        rider_id: rider.id,
        verified: false // Can be manually verified by admin later
      })
      .select()
      .single();

    if (linkError) {
      console.error('Error creating link:', linkError);
      return NextResponse.json(
        { error: 'Failed to link rider', details: linkError.message },
        { status: 500 }
      );
    }

    console.log(`Successfully linked rider ${rider.id} to user ${user_id}`);

    return NextResponse.json({
      success: true,
      message: 'Rider successfully linked to your account',
      rider,
      link
    });
  } catch (error) {
    console.error('Error in POST /api/riders/link:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get all riders linked to a user
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all linked riders for the user
    const { data: links, error: linksError } = await supabaseAdmin
      .from('user_riders')
      .select(`
        *,
        riders (*)
      `)
      .eq('user_id', user_id);

    if (linksError) {
      console.error('Error fetching linked riders:', linksError);
      return NextResponse.json(
        { error: 'Failed to fetch linked riders', details: linksError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      links: links || []
    });
  } catch (error) {
    console.error('Error in GET /api/riders/link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Unlink a rider from the current user
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const link_id = searchParams.get('link_id');
    const user_id = searchParams.get('user_id');

    if (!link_id || !user_id) {
      return NextResponse.json(
        { error: 'Link ID and User ID are required' },
        { status: 400 }
      );
    }

    // Delete the link (with user_id check for security)
    const { error: deleteError } = await supabaseAdmin
      .from('user_riders')
      .delete()
      .eq('id', link_id)
      .eq('user_id', user_id);

    if (deleteError) {
      console.error('Error deleting link:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unlink rider', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`Successfully unlinked rider link ${link_id} for user ${user_id}`);

    return NextResponse.json({
      success: true,
      message: 'Rider successfully unlinked'
    });
  } catch (error) {
    console.error('Error in DELETE /api/riders/link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
