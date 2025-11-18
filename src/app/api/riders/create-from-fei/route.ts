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

// Helper function to convert country name to ISO 3-letter code
function getCountryCode(countryName: string): string {
  const countryMap: { [key: string]: string } = {
    // Common countries
    'afghanistan': 'AFG', 'albania': 'ALB', 'algeria': 'DZA', 'andorra': 'AND',
    'angola': 'AGO', 'antigua and barbuda': 'ATG', 'argentina': 'ARG', 'armenia': 'ARM',
    'australia': 'AUS', 'austria': 'AUT', 'azerbaijan': 'AZE', 'bahamas': 'BHS',
    'bahrain': 'BHR', 'bangladesh': 'BGD', 'barbados': 'BRB', 'belarus': 'BLR',
    'belgium': 'BEL', 'belize': 'BLZ', 'benin': 'BEN', 'bhutan': 'BTN',
    'bolivia': 'BOL', 'bosnia and herzegovina': 'BIH', 'botswana': 'BWA', 'brazil': 'BRA',
    'brunei': 'BRN', 'bulgaria': 'BGR', 'burkina faso': 'BFA', 'burundi': 'BDI',
    'cambodia': 'KHM', 'cameroon': 'CMR', 'canada': 'CAN', 'cape verde': 'CPV',
    'central african republic': 'CAF', 'chad': 'TCD', 'chile': 'CHL', 'china': 'CHN',
    'colombia': 'COL', 'comoros': 'COM', 'congo': 'COG', 'costa rica': 'CRI',
    'croatia': 'HRV', 'cuba': 'CUB', 'cyprus': 'CYP', 'czech republic': 'CZE',
    'denmark': 'DNK', 'djibouti': 'DJI', 'dominica': 'DMA', 'dominican republic': 'DOM',
    'ecuador': 'ECU', 'egypt': 'EGY', 'el salvador': 'SLV', 'equatorial guinea': 'GNQ',
    'eritrea': 'ERI', 'estonia': 'EST', 'ethiopia': 'ETH', 'fiji': 'FJI',
    'finland': 'FIN', 'france': 'FRA', 'gabon': 'GAB', 'gambia': 'GMB',
    'georgia': 'GEO', 'germany': 'DEU', 'ghana': 'GHA', 'greece': 'GRC',
    'grenada': 'GRD', 'guatemala': 'GTM', 'guinea': 'GIN', 'guinea-bissau': 'GNB',
    'guyana': 'GUY', 'haiti': 'HTI', 'honduras': 'HND', 'hungary': 'HUN',
    'iceland': 'ISL', 'india': 'IND', 'indonesia': 'IDN', 'iran': 'IRN',
    'iraq': 'IRQ', 'ireland': 'IRL', 'israel': 'ISR', 'italy': 'ITA',
    'jamaica': 'JAM', 'japan': 'JPN', 'jordan': 'JOR', 'kazakhstan': 'KAZ',
    'kenya': 'KEN', 'kiribati': 'KIR', 'kuwait': 'KWT', 'kyrgyzstan': 'KGZ',
    'laos': 'LAO', 'latvia': 'LVA', 'lebanon': 'LBN', 'lesotho': 'LSO',
    'liberia': 'LBR', 'libya': 'LBY', 'liechtenstein': 'LIE', 'lithuania': 'LTU',
    'luxembourg': 'LUX', 'madagascar': 'MDG', 'malawi': 'MWI', 'malaysia': 'MYS',
    'maldives': 'MDV', 'mali': 'MLI', 'malta': 'MLT', 'marshall islands': 'MHL',
    'mauritania': 'MRT', 'mauritius': 'MUS', 'mexico': 'MEX', 'micronesia': 'FSM',
    'moldova': 'MDA', 'monaco': 'MCO', 'mongolia': 'MNG', 'montenegro': 'MNE',
    'morocco': 'MAR', 'mozambique': 'MOZ', 'myanmar': 'MMR', 'namibia': 'NAM',
    'nauru': 'NRU', 'nepal': 'NPL', 'netherlands': 'NLD', 'new zealand': 'NZL',
    'nicaragua': 'NIC', 'niger': 'NER', 'nigeria': 'NGA', 'north korea': 'PRK',
    'north macedonia': 'MKD', 'norway': 'NOR', 'oman': 'OMN', 'pakistan': 'PAK',
    'palau': 'PLW', 'palestine': 'PSE', 'panama': 'PAN', 'papua new guinea': 'PNG',
    'paraguay': 'PRY', 'peru': 'PER', 'philippines': 'PHL', 'poland': 'POL',
    'portugal': 'PRT', 'qatar': 'QAT', 'romania': 'ROU', 'russia': 'RUS',
    'rwanda': 'RWA', 'saint kitts and nevis': 'KNA', 'saint lucia': 'LCA',
    'saint vincent and the grenadines': 'VCT', 'samoa': 'WSM', 'san marino': 'SMR',
    'sao tome and principe': 'STP', 'saudi arabia': 'SAU', 'senegal': 'SEN',
    'serbia': 'SRB', 'seychelles': 'SYC', 'sierra leone': 'SLE', 'singapore': 'SGP',
    'slovakia': 'SVK', 'slovenia': 'SVN', 'solomon islands': 'SLB', 'somalia': 'SOM',
    'south africa': 'ZAF', 'south korea': 'KOR', 'south sudan': 'SSD', 'spain': 'ESP',
    'sri lanka': 'LKA', 'sudan': 'SDN', 'suriname': 'SUR', 'sweden': 'SWE',
    'switzerland': 'CHE', 'syria': 'SYR', 'taiwan': 'TWN', 'tajikistan': 'TJK',
    'tanzania': 'TZA', 'thailand': 'THA', 'timor-leste': 'TLS', 'togo': 'TGO',
    'tonga': 'TON', 'trinidad and tobago': 'TTO', 'tunisia': 'TUN', 'turkey': 'TUR',
    'turkmenistan': 'TKM', 'tuvalu': 'TUV', 'uganda': 'UGA', 'ukraine': 'UKR',
    'united arab emirates': 'ARE', 'united kingdom': 'GBR', 'uk': 'GBR',
    'united states': 'USA', 'usa': 'USA', 'uruguay': 'URY', 'uzbekistan': 'UZB',
    'vanuatu': 'VUT', 'vatican city': 'VAT', 'venezuela': 'VEN', 'vietnam': 'VNM',
    'yemen': 'YEM', 'zambia': 'ZMB', 'zimbabwe': 'ZWE'
  };

  const normalized = countryName.toLowerCase().trim();

  // If it's already a 3-letter code, return it
  if (normalized.length === 3 && normalized === normalized.toUpperCase()) {
    return normalized;
  }

  return countryMap[normalized] || countryName.toUpperCase().substring(0, 3);
}

// POST - Create a new rider from FEI data with additional details
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
      first_name,
      last_name,
      fei_registration,
      licence,
      country,
      club_name,
      user_id
    } = body;

    if (!first_name || !last_name || !fei_registration) {
      return NextResponse.json(
        { error: 'First name, last name, and FEI Registration are required' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const full_name = `${first_name} ${last_name}`.trim();
    console.log(`Creating new rider: ${full_name} (FEI: ${fei_registration})`);

    // Convert country name to 3-letter code if needed
    const countryCode = country ? getCountryCode(country) : null;

    // Create the rider
    const { data: rider, error: createError } = await supabaseAdmin
      .from('riders')
      .insert({
        first_name,
        last_name,
        full_name,
        fei_registration,
        licence: licence || null,
        country: countryCode,
        club_name: club_name || null
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating rider:', createError);
      return NextResponse.json(
        { error: 'Failed to create rider', details: createError.message },
        { status: 500 }
      );
    }

    console.log(`Rider created successfully: ${rider.id}`);

    // Link the rider to the user
    const { data: link, error: linkError } = await supabaseAdmin
      .from('user_riders')
      .insert({
        user_id,
        rider_id: rider.id,
        verified: false
      })
      .select()
      .single();

    if (linkError) {
      console.error('Error linking rider:', linkError);
      // Try to clean up the created rider
      await supabaseAdmin.from('riders').delete().eq('id', rider.id);

      return NextResponse.json(
        { error: 'Failed to link rider', details: linkError.message },
        { status: 500 }
      );
    }

    console.log(`Rider linked successfully to user ${user_id}`);

    return NextResponse.json({
      success: true,
      message: 'Rider created and linked successfully',
      rider,
      link
    });
  } catch (error) {
    console.error('Error in POST /api/riders/create-from-fei:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
