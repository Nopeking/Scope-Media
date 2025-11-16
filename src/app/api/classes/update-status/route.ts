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

// POST - Update class statuses based on date and time
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Fetch all classes that are not cancelled
    const { data: classes, error: fetchError } = await supabaseAdmin
      .from('classes')
      .select('id, class_date, start_time, status')
      .neq('status', 'cancelled');

    if (fetchError) {
      console.error('Error fetching classes:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!classes || classes.length === 0) {
      return NextResponse.json({ updated: 0, message: 'No classes to update' });
    }

    let updatedCount = 0;
    const updates: Array<{ id: string; newStatus: string }> = [];

    for (const classItem of classes) {
      if (!classItem.class_date || !classItem.start_time) {
        continue; // Skip classes without date/time
      }

      const classDate = new Date(classItem.class_date);
      classDate.setHours(0, 0, 0, 0);

      let newStatus = classItem.status;

      // Check if class date is today
      const isToday = today.getTime() === classDate.getTime();

        // Check if class should be ongoing
        if (isToday && classItem.start_time && classItem.status === 'upcoming') {
          // Compare current time with start time
          const [startHour, startMinute] = classItem.start_time.split(':').map(Number);
          const [currentHour, currentMinute] = currentTime.split(':').map(Number);
          
          const startTimeMinutes = startHour * 60 + startMinute;
          const currentTimeMinutes = currentHour * 60 + currentMinute;

          if (currentTimeMinutes >= startTimeMinutes) {
            newStatus = 'ongoing';
          }
        }
      // Check if class date has passed and should be completed
      else if (today > classDate && classItem.status !== 'completed') {
        // Only auto-complete if it was ongoing or upcoming
        if (classItem.status === 'ongoing' || classItem.status === 'upcoming') {
          // Don't auto-complete, let admin manually complete
          // newStatus = 'completed';
        }
      }

      // Only update if status changed
      if (newStatus !== classItem.status) {
        const { error: updateError } = await supabaseAdmin
          .from('classes')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', classItem.id);

        if (updateError) {
          console.error(`Error updating class ${classItem.id}:`, updateError);
        } else {
          updatedCount++;
          updates.push({ id: classItem.id, newStatus });
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: classes.length,
      updates
    });
  } catch (error) {
    console.error('Error in POST /api/classes/update-status:', error);
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

