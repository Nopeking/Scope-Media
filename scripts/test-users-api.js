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

async function testUsersAPI() {
  console.log('🔍 Testing users API response...');

  try {
    // Test the users API directly
    console.log('\n📊 Testing users API endpoint...');
    const response = await fetch('http://localhost:3000/api/users');
    const users = await response.json();
    
    if (response.ok) {
      console.log('✅ API endpoint working');
      console.log(`📊 Found ${users.length} users:`);
      
      users.forEach((user, index) => {
        console.log(`\n👤 User ${index + 1}:`);
        console.log(`  ID: ${user.id || 'MISSING'}`);
        console.log(`  Email: ${user.email || 'MISSING'}`);
        console.log(`  Full Name: ${user.full_name || 'MISSING'}`);
        console.log(`  Plan: ${user.subscription_plan || 'MISSING'}`);
        console.log(`  Created At: ${user.created_at || 'MISSING'}`);
        console.log(`  Updated At: ${user.updated_at || 'MISSING'}`);
      });
    } else {
      console.error('❌ API endpoint error:', users);
    }

    // Test direct database query
    console.log('\n🗄️ Testing direct database query...');
    const { data: dbUsers, error: dbError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Database query error:', dbError);
    } else {
      console.log('✅ Database query successful');
      console.log(`📊 Found ${dbUsers?.length || 0} users in database:`);
      
      dbUsers?.forEach((user, index) => {
        console.log(`\n👤 DB User ${index + 1}:`);
        console.log(`  ID: ${user.id || 'MISSING'}`);
        console.log(`  Email: ${user.email || 'MISSING'}`);
        console.log(`  Full Name: ${user.full_name || 'MISSING'}`);
        console.log(`  Plan: ${user.subscription_plan || 'MISSING'}`);
        console.log(`  Created At: ${user.created_at || 'MISSING'}`);
        console.log(`  Updated At: ${user.updated_at || 'MISSING'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testUsersAPI();
