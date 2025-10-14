import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Fetch all users (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('📥 Fetching all users...');

    const { data: users, error } = await getSupabaseAdmin()
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log(`✅ Fetched ${users?.length || 0} users`);
    return NextResponse.json(users || []);
  } catch (error: any) {
    console.error('❌ Error in users GET:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Update user profile (admin only)
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    const { userId, ...profileUpdates } = updates;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📝 Updating user profile:', userId);

    const { data: user, error } = await getSupabaseAdmin()
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
