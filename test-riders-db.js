// Test script to verify riders table and Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('\n1. Testing connection to Supabase...');

    // Test basic query
    const { data: tables, error: tablesError } = await supabase
      .from('riders')
      .select('count')
      .limit(0);

    if (tablesError) {
      if (tablesError.code === '42P01') {
        console.error('❌ Riders table does NOT exist!');
        console.log('\n📝 You need to create the riders table in Supabase:');
        console.log('   1. Go to https://app.supabase.com');
        console.log('   2. Open SQL Editor');
        console.log('   3. Run the SQL from supabase-schema.sql (lines 170-216)');
        return;
      }
      console.error('❌ Error:', tablesError.message);
      return;
    }

    console.log('✅ Riders table exists!');

    // Count riders
    const { count, error: countError } = await supabase
      .from('riders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting riders:', countError.message);
      return;
    }

    console.log(`✅ Current riders in database: ${count}`);

    // Test insert
    console.log('\n2. Testing insert...');
    const testRider = {
      external_id: 'TEST001',
      licence: 'TEST-LICENCE-001',
      licence_year: 2024,
      first_name: 'Test',
      last_name: 'Rider',
      full_name: 'Test Rider',
      email: 'test@example.com',
      city: 'Test City',
      country: 'UAE',
      is_active: true
    };

    const { data: inserted, error: insertError } = await supabase
      .from('riders')
      .upsert(testRider, { onConflict: 'external_id' })
      .select();

    if (insertError) {
      console.error('❌ Error inserting test rider:', insertError.message);
      return;
    }

    console.log('✅ Successfully inserted/updated test rider!');

    // Clean up
    await supabase
      .from('riders')
      .delete()
      .eq('external_id', 'TEST001');

    console.log('\n✅ All tests passed! Database is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Use the import API to add your rider data');
    console.log('2. Or fix the external API endpoint URL');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

test();
