const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔐 Testing login functionality...');

  try {
    // Test demo user login
    console.log('\n👤 Testing demo user login...');
    const { data: demoAuthData, error: demoAuthError } = await supabase.auth.signInWithPassword({
      email: 'demo@scopemedia.com',
      password: 'demo123',
    });

    if (demoAuthError) {
      console.error('❌ Demo user login failed:', demoAuthError.message);
    } else {
      console.log('✅ Demo user login successful:', demoAuthData.user?.id);
      
      // Test fetching user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', demoAuthData.user?.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message);
      } else {
        console.log('✅ Profile fetch successful:', profileData);
      }

      // Sign out
      await supabase.auth.signOut();
      console.log('🚪 Signed out');
    }

    // Test admin user login
    console.log('\n👑 Testing admin user login...');
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123',
    });

    if (adminAuthError) {
      console.error('❌ Admin user login failed:', adminAuthError.message);
    } else {
      console.log('✅ Admin user login successful:', adminAuthData.user?.id);
      
      // Test fetching admin profile
      const { data: adminProfileData, error: adminProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', adminAuthData.user?.id)
        .single();

      if (adminProfileError) {
        console.error('❌ Admin profile fetch failed:', adminProfileError.message);
      } else {
        console.log('✅ Admin profile fetch successful:', adminProfileData);
      }

      // Sign out
      await supabase.auth.signOut();
      console.log('🚪 Signed out');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testLogin();
