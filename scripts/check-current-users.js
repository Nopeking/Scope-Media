const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function checkCurrentUsers() {
  console.log('🔍 Checking current users in the database...');

  try {
    // Get all user profiles
    const { data: userProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching user profiles:', profilesError.message);
      return;
    }

    console.log(`\n📊 Found ${userProfiles?.length || 0} user profiles:`);
    
    if (userProfiles && userProfiles.length > 0) {
      userProfiles.forEach((profile, index) => {
        console.log(`\n👤 User ${index + 1}:`);
        console.log(`  ID: ${profile.id}`);
        console.log(`  Email: ${profile.email}`);
        console.log(`  Name: ${profile.full_name || 'Not set'}`);
        console.log(`  Plan: ${profile.subscription_plan}`);
        console.log(`  Created: ${profile.created_at}`);
      });
    } else {
      console.log('No user profiles found.');
    }

    // Get auth users
    console.log('\n🔐 Checking auth users...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
    } else {
      console.log(`\n📊 Found ${authUsers?.users?.length || 0} auth users:`);
      
      if (authUsers?.users && authUsers.users.length > 0) {
        authUsers.users.forEach((authUser, index) => {
          console.log(`\n🔑 Auth User ${index + 1}:`);
          console.log(`  ID: ${authUser.id}`);
          console.log(`  Email: ${authUser.email}`);
          console.log(`  Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
          console.log(`  Created: ${authUser.created_at}`);
        });
      } else {
        console.log('No auth users found.');
      }
    }

    // Check for the specific user ID from logs
    const problemUserId = '46d25b33-6355-4412-ad3c-d326be144204';
    console.log(`\n🔍 Checking for problem user ID: ${problemUserId}`);
    
    const { data: problemUser, error: problemError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', problemUserId)
      .single();

    if (problemError && problemError.code !== 'PGRST116') {
      console.error('❌ Error checking problem user:', problemError.message);
    } else if (problemUser) {
      console.log('✅ Found problem user in profiles:', problemUser);
    } else {
      console.log('❌ Problem user not found in user_profiles table');
    }

    // Check auth users for this ID
    const { data: problemAuthUser, error: problemAuthError } = await supabaseAdmin.auth.admin.getUserById(problemUserId);
    
    if (problemAuthError && problemAuthError.message !== 'User not found') {
      console.error('❌ Error checking problem auth user:', problemAuthError.message);
    } else if (problemAuthUser?.user) {
      console.log('✅ Found problem user in auth:', problemAuthUser.user);
    } else {
      console.log('❌ Problem user not found in auth.users table');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkCurrentUsers();
