import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';
import { parseStringPromise } from 'xml2js';

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

// UAE ERF API endpoint (SOAP Web Service)
const UAE_ERF_API_URL = 'http://ws.uaeerf.ae/webservices/wsequipe.asmx/getRiderList';

interface ApiRider {
  id: string;
  licence: string;
  licence_year: number;
  first_name: string;
  last_name: string;
  address: string;
  zipcode: string;
  city: string;
  address_country: string;
  home_phone: string;
  club_id: string;
  club_name: string;
  email: string;
  country: string;
  FEIRegistration: string;
}

// POST - Sync riders from UAE ERF API
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    console.log('Starting rider sync from UAE ERF API...');
    console.log('Fetching from:', UAE_ERF_API_URL);

    // Fetch data from UAE ERF API
    const response = await fetch(UAE_ERF_API_URL, {
      method: 'GET',
      headers: {
        'Host': 'ws.uaeerf.ae',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch from UAE ERF API:', response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch from UAE ERF API: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    console.log('Response content-type:', contentType);

    let ridersData: ApiRider[] = [];

    // Get response as text first
    const responseText = await response.text();
    console.log('Response preview:', responseText.substring(0, 500));

    // Check if response is JSON or XML based on content-type and first character
    const isJson = contentType.includes('json') || responseText.trim().startsWith('{') || responseText.trim().startsWith('[');
    const isXml = contentType.includes('xml') || responseText.trim().startsWith('<');

    if (isJson) {
      // Parse as JSON first (most common case)
      try {
        const jsonData = JSON.parse(responseText);
        if (jsonData.riders && Array.isArray(jsonData.riders)) {
          ridersData = jsonData.riders;
        } else if (Array.isArray(jsonData)) {
          ridersData = jsonData;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          ridersData = jsonData.data;
        } else {
          return NextResponse.json(
            {
              error: 'JSON response does not contain riders array',
              structure: Object.keys(jsonData),
              preview: responseText.substring(0, 200)
            },
            { status: 500 }
          );
        }
        console.log(`Successfully parsed ${ridersData.length} riders from JSON`);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        return NextResponse.json(
          {
            error: 'Failed to parse JSON response',
            details: jsonError instanceof Error ? jsonError.message : 'Unknown error',
            preview: responseText.substring(0, 200)
          },
          { status: 500 }
        );
      }
    } else if (isXml) {
      // Try to parse as XML (SOAP response)
      try {
        const xmlData = await parseStringPromise(responseText);
        console.log('Parsed XML structure:', JSON.stringify(xmlData, null, 2).substring(0, 500));

        // Extract riders from XML
        // The structure might be: <getRiderListResponse><getRiderListResult>...</getRiderListResult></getRiderListResponse>
        // or similar SOAP envelope
        if (xmlData && typeof xmlData === 'object') {
          // Try to find the array of riders in the XML structure
          const extractRiders = (obj: any): any[] => {
            if (Array.isArray(obj)) {
              return obj;
            }
            if (obj && typeof obj === 'object') {
              // Look for common patterns
              for (const key of Object.keys(obj)) {
                if (key.toLowerCase().includes('rider') || key.toLowerCase().includes('result')) {
                  const result = extractRiders(obj[key]);
                  if (result.length > 0) return result;
                }
              }
              // Try all values
              for (const value of Object.values(obj)) {
                const result = extractRiders(value);
                if (result.length > 0) return result;
              }
            }
            return [];
          };

          ridersData = extractRiders(xmlData);
          console.log(`Extracted ${ridersData.length} riders from XML`);
        }

        if (ridersData.length === 0) {
          return NextResponse.json(
            {
              error: 'No riders found in XML response',
              xmlStructure: JSON.stringify(xmlData).substring(0, 300),
              hint: 'The XML structure may be different than expected'
            },
            { status: 500 }
          );
        }
      } catch (xmlError) {
        console.error('XML parsing error:', xmlError);
        return NextResponse.json(
          {
            error: 'Failed to parse XML response',
            details: xmlError instanceof Error ? xmlError.message : 'Unknown error',
            preview: responseText.substring(0, 200)
          },
          { status: 500 }
        );
      }
    } else {
      // Unknown format, try both
      try {
        const jsonData = JSON.parse(responseText);
        if (jsonData.riders && Array.isArray(jsonData.riders)) {
          ridersData = jsonData.riders;
        } else if (Array.isArray(jsonData)) {
          ridersData = jsonData;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          ridersData = jsonData.data;
        }
      } catch {
        // Not JSON, try XML
        try {
          const xmlData = await parseStringPromise(responseText);
          // Extract riders from XML (same logic as above)
          const extractRiders = (obj: any): any[] => {
            if (Array.isArray(obj)) return obj;
            if (obj && typeof obj === 'object') {
              for (const key of Object.keys(obj)) {
                if (key.toLowerCase().includes('rider') || key.toLowerCase().includes('result')) {
                  const result = extractRiders(obj[key]);
                  if (result.length > 0) return result;
                }
              }
            }
            return [];
          };
          ridersData = extractRiders(xmlData);
        } catch {
          return NextResponse.json(
            {
              error: 'Unable to parse response as JSON or XML',
              contentType,
              preview: responseText.substring(0, 200)
            },
            { status: 500 }
          );
        }
      }
    }

    console.log(`Found ${ridersData.length} riders to sync`);

    if (ridersData.length === 0) {
      return NextResponse.json({
        success: true,
        synced: 0,
        errors: 0,
        message: 'No riders found in API response',
        timestamp: new Date().toISOString()
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Sync each rider to database
    for (const riderData of ridersData) {
      try {
        const mappedRider = mapRiderData(riderData);

        const { error } = await supabaseAdmin
          .from('riders')
          .upsert(mappedRider, {
            onConflict: 'external_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`Error syncing rider ${riderData.id}:`, error);
          errorCount++;
          errors.push(`${riderData.first_name} ${riderData.last_name}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err) {
        console.error('Error processing rider:', err);
        errorCount++;
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Processing error for ${riderData.id}: ${errorMsg}`);
      }
    }

    console.log(`Sync complete: ${successCount} succeeded, ${errorCount} failed`);

    return NextResponse.json({
      success: true,
      synced: successCount,
      errors: errorCount,
      total: ridersData.length,
      errorDetails: errors.slice(0, 10), // Return first 10 errors
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/riders/sync:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get sync status
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Get count of riders and last sync time
    const { data: riders, error } = await supabaseAdmin
      .from('riders')
      .select('last_synced_at')
      .order('last_synced_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching sync status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { count } = await supabaseAdmin
      .from('riders')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      totalRiders: count || 0,
      lastSyncedAt: riders && riders.length > 0 ? riders[0].last_synced_at : null
    });
  } catch (error) {
    console.error('Error in GET /api/riders/sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to map API data to database schema
function mapRiderData(apiData: ApiRider): any {
  const mapped = {
    external_id: apiData.id || null,
    licence: apiData.licence || null,
    licence_year: apiData.licence_year || null,
    first_name: apiData.first_name || 'Unknown',
    last_name: apiData.last_name || 'Unknown',
    full_name: `${apiData.first_name} ${apiData.last_name}`.trim() || null,
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
    profile_image_url: null, // Not provided by API
    is_active: true, // Default to active
    metadata: apiData, // Store full API response for reference
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return mapped;
}
