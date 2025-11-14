import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Fetch all users (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('📥 Fetching all users...');

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase not configured, returning empty array');
      return NextResponse.json([]);
    }

    // Fetch users
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Fetch user_riders with rider data for all users
    const { data: userRiders, error: riderError } = await supabaseAdmin
      .from('user_riders')
      .select(`
        id,
        user_id,
        rider_id,
        verified,
        linked_at,
        riders (
          id,
          first_name,
          last_name,
          full_name,
          licence,
          fei_registration,
          club_name,
          country
        )
      `);

    if (riderError) {
      console.error('❌ Error fetching user riders:', riderError);
      // Continue without rider data instead of failing
    }

    // Merge rider data with users
    const usersWithRiders = users?.map(user => ({
      ...user,
      user_riders: userRiders?.filter(ur => ur.user_id === user.id) || []
    })) || [];

    console.log(`✅ Fetched ${usersWithRiders.length} users with rider data`);
    return NextResponse.json(usersWithRiders);
  } catch (error: any) {
    console.error('❌ Error in users GET:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Update user profile (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const updates = await request.json();
    const { userId, ...profileUpdates } = updates;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📝 Updating user profile:', userId);

    const { data: user, error } = await supabaseAdmin
      .from('user_profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating user profile:', error);
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    console.log('✅ User profile updated successfully');
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('❌ Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
