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

async function testUserLibrary() {
  console.log('🔍 Testing user library for specific user...');

  const userId = '46d25b33-6355-4412-ad3c-d326be144204';
  console.log(`Testing user: ${userId}`);

  try {
    // Test the user library API directly
    console.log('\n📚 Testing user library API...');
    const { data: libraryItems, error } = await supabaseAdmin
      .from('user_library')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user library:', error);
    } else {
      console.log(`✅ Found ${libraryItems?.length || 0} library items for user ${userId}`);
      if (libraryItems && libraryItems.length > 0) {
        libraryItems.forEach((item, index) => {
          console.log(`\n📄 Item ${index + 1}:`);
          console.log(`  ID: ${item.id}`);
          console.log(`  Title: ${item.title}`);
          console.log(`  Type: ${item.content_type}`);
          console.log(`  Created: ${item.created_at}`);
        });
      } else {
        console.log('📭 No library items found for this user');
      }
    }

    // Test if user exists in user_profiles
    console.log('\n👤 Checking user profile...');
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
    } else {
      console.log('✅ User profile found:', userProfile);
    }

    // Test the actual API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch(`http://localhost:3000/api/user-library?userId=${userId}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API endpoint working:', data);
    } else {
      console.error('❌ API endpoint error:', data);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testUserLibrary();
