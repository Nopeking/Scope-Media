const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing Supabase database connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? '✅ Set' : '❌ Missing');

  try {
    // Test basic connection
    console.log('\n📡 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('streams')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection error:', connectionError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // Check if user_profiles table exists
    console.log('\n👤 Checking user_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ user_profiles table error:', profilesError.message);
      console.error('Error code:', profilesError.code);
      console.error('Error details:', profilesError.details);
      
      if (profilesError.code === '42P01') {
        console.log('\n💡 The user_profiles table does not exist!');
        console.log('📋 You need to run the schema to create the table:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and run the contents of supabase-schema-safe.sql');
      }
    } else {
      console.log('✅ user_profiles table exists');
      console.log('📊 Found', profiles?.length || 0, 'user profiles');
    }

    // Check other tables
    console.log('\n📊 Checking other tables...');
    const tables = ['streams', 'archived_videos', 'custom_titles', 'user_library', 'user_library_sharing'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testDatabase();
