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

// POST - Update show statuses based on dates
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Fetch all shows that are not cancelled
    const { data: shows, error: fetchError } = await supabaseAdmin
      .from('shows')
      .select('id, start_date, end_date, status')
      .neq('status', 'cancelled');

    if (fetchError) {
      console.error('Error fetching shows:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!shows || shows.length === 0) {
      return NextResponse.json({ updated: 0, message: 'No shows to update' });
    }

    let updatedCount = 0;
    const updates: Array<{ id: string; newStatus: string }> = [];

    for (const show of shows) {
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

      // Only update if status changed
      if (newStatus !== show.status) {
        const { error: updateError } = await supabaseAdmin
          .from('shows')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', show.id);

        if (updateError) {
          console.error(`Error updating show ${show.id}:`, updateError);
        } else {
          updatedCount++;
          updates.push({ id: show.id, newStatus });
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: shows.length,
      updates
    });
  } catch (error) {
    console.error('Error in POST /api/shows/update-status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Update statuses and return result (for manual trigger)
export async function GET(request: NextRequest) {
  return POST(request);
}

