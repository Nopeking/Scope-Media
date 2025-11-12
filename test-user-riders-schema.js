// Test script to verify user_riders table exists
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing user_riders table...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // Test if user_riders table exists
    console.log('\n1. Checking if user_riders table exists...');
    const { data, error } = await supabase
      .from('user_riders')
      .select('count')
      .limit(0);

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ user_riders table does NOT exist!');
        console.log('\n📝 You need to run the schema update:');
        console.log('   1. Go to https://app.supabase.com');
        console.log('   2. Open SQL Editor');
        console.log('   3. Run the SQL from supabase-schema.sql (lines 218-241)');
        return;
      }
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('✅ user_riders table exists!');

    // Count user_riders
    const { count, error: countError } = await supabase
      .from('user_riders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting links:', countError.message);
      return;
    }

    console.log(`✅ Current links in database: ${count}`);
    console.log('\n✅ Schema is ready! You can now link riders to user accounts.');
    console.log('\nNext steps:');
    console.log('1. Make sure you have riders in the database (run sync or import)');
    console.log('2. Visit http://localhost:3000/profile/link-rider to link your profile');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

test();
