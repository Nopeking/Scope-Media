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

// POST - Import riders from JSON payload
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Expect { riders: [...] } or just [...]
    let ridersData = Array.isArray(body) ? body : body.riders;

    if (!ridersData || !Array.isArray(ridersData)) {
      return NextResponse.json(
        { error: 'Invalid format. Expected { riders: [...] } or [...]' },
        { status: 400 }
      );
    }

    console.log(`Importing ${ridersData.length} riders...`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Import each rider
    for (const apiData of ridersData) {
      try {
        const mappedRider = {
          external_id: apiData.id || null,
          licence: apiData.licence || null,
          licence_year: apiData.licence_year || null,
          first_name: apiData.first_name || 'Unknown',
          last_name: apiData.last_name || 'Unknown',
          full_name: `${apiData.first_name || ''} ${apiData.last_name || ''}`.trim() || null,
          email: apiData.email || null,
          phone: apiData.home_phone || null,
          address: apiData.address || null,
          zipcode: apiData.zipcode || null,
          city: apiData.city || null,
          address_country: apiData.address_country || null,
          country: apiData.country || null,
          club_id: apiData.club_id || null,
          club_name: apiData.club_name || null,
          fei_registration: apiData.FEIRegistration || null,
          profile_image_url: null,
          is_active: true,
          metadata: apiData,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
          .from('riders')
          .upsert(mappedRider, {
            onConflict: 'external_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`Error importing rider ${apiData.id}:`, error);
          errorCount++;
          errors.push(`${apiData.first_name} ${apiData.last_name}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err) {
        console.error('Error processing rider:', err);
        errorCount++;
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${apiData.id}: ${errorMsg}`);
      }
    }

    console.log(`Import complete: ${successCount} succeeded, ${errorCount} failed`);

    return NextResponse.json({
      success: true,
      imported: successCount,
      errors: errorCount,
      total: ridersData.length,
      errorDetails: errors.slice(0, 10),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/riders/import:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
