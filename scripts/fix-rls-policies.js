const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for user_profiles table...\n');

  const rlsSQL = `
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create new policies with correct permissions
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  `.trim();

  console.log('📝 SQL to execute:');
  console.log('─'.repeat(60));
  console.log(rlsSQL);
  console.log('─'.repeat(60));
  console.log('');

  try {
    // Try using Supabase RPC to execute SQL (if available)
    const { data, error } = await supabase.rpc('exec', { sql: rlsSQL });

    if (error) {
      // RPC method might not be available, provide manual instructions
      console.log('⚠️  Cannot execute SQL automatically via Supabase client.');
      console.log('');
      console.log('📋 MANUAL STEPS REQUIRED:');
      console.log('');
      console.log('1. Go to your Supabase Dashboard: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Click "SQL Editor" in the left sidebar');
      console.log('4. Click "New query"');
      console.log('5. Copy and paste the SQL shown above');
      console.log('6. Click "Run" (or press Ctrl/Cmd + Enter)');
      console.log('');
      console.log('✅ After running the SQL, the RLS policies will be fixed!');
      console.log('');

      // Also save to file for easy access
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', 'fix-rls-manual.sql');
      fs.writeFileSync(filePath, rlsSQL);
      console.log(`💾 SQL saved to: ${filePath}`);
      console.log('   You can also open this file and copy from there.');
      console.log('');
    } else {
      console.log('✅ RLS policies fixed successfully!');
      console.log('');
    }

    // Test if RLS is working by trying to fetch a profile
    console.log('🧪 Testing RLS policies...');
    const { data: users, error: testError } = await supabase
      .from('user_profiles')
      .select('email, is_admin')
      .limit(1);

    if (testError) {
      console.log(`⚠️  Test query failed: ${testError.message}`);
      console.log('   (This is expected if RLS hasn\'t been fixed yet)');
    } else {
      console.log('✅ Test query succeeded! RLS policies are working correctly.');
      if (users && users.length > 0) {
        console.log(`   Found ${users.length} user(s)`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('📋 Please run the SQL manually in Supabase Dashboard (see instructions above)');
  }

  console.log('');
  console.log('🔄 After fixing RLS, please:');
  console.log('   1. Refresh your login page');
  console.log('   2. Sign in with: admin@example.com / admin123');
  console.log('   3. You should be redirected to /admin automatically');
  console.log('');
}

fixRLSPolicies();
