import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron job endpoint to automatically sync riders
 *
 * This endpoint should be called periodically by:
 * 1. Vercel Cron Jobs (vercel.json configuration)
 * 2. External cron service (e.g., cron-job.org)
 * 3. Server cron job (if self-hosted)
 *
 * Recommended schedule: Every 6 hours or daily
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (using a secret key)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Cron job triggered: Syncing riders from UAE ERF API');

    // Get the base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Call the sync API endpoint
    const syncResponse = await fetch(`${baseUrl}/api/riders/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json();
      console.error('Sync failed:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: 'Sync failed',
          details: errorData
        },
        { status: 500 }
      );
    }

    const syncResult = await syncResponse.json();
    console.log('Sync completed successfully:', syncResult);

    return NextResponse.json({
      success: true,
      message: 'Rider sync completed',
      result: syncResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST method
export async function POST(request: NextRequest) {
  return GET(request);
}
