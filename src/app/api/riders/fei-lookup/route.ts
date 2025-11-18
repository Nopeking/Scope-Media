import { NextRequest, NextResponse } from 'next/server';

// POST - Fetch rider data from FEI website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fei_registration } = body;

    if (!fei_registration) {
      return NextResponse.json(
        { error: 'FEI Registration number is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching rider data from FEI: ${fei_registration}`);

    // Fetch from FEI website
    const feiUrl = `https://www.fei.org/athlete/${fei_registration}`;
    const response = await fetch(feiUrl);

    if (!response.ok) {
      console.error(`FEI lookup failed with status: ${response.status}`);
      return NextResponse.json(
        { error: 'Rider not found on FEI website', fei_registration },
        { status: 404 }
      );
    }

    const html = await response.text();

    // Extract rider name from <h1 class="name">
    const nameMatch = html.match(/<h1[^>]*class="name"[^>]*>(.*?)<\/h1>/i);

    if (!nameMatch || !nameMatch[1]) {
      console.error('Could not extract rider name from FEI page');
      return NextResponse.json(
        { error: 'Could not extract rider information from FEI website' },
        { status: 500 }
      );
    }

    // Clean up the name (remove HTML tags and trim whitespace)
    const riderName = nameMatch[1].replace(/<[^>]*>/g, '').trim();

    console.log(`Found rider on FEI: ${riderName}`);

    return NextResponse.json({
      success: true,
      rider: {
        full_name: riderName,
        fei_registration: fei_registration,
        fei_url: feiUrl
      }
    });
  } catch (error) {
    console.error('Error in POST /api/riders/fei-lookup:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch rider data from FEI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
