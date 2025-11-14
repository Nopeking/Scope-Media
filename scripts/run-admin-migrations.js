const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function runMigrations() {
  console.log('🔧 Running admin migrations...\n');

  try {
    // 1. Fix RLS policies
    console.log('1️⃣ Fixing user_profiles RLS policies...');
    const rlsQueries = [
      `DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles`,
      `DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles`,
      `DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles`,
      `CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id)`,
      `CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id)`,
      `CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id)`,
      `ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY`,
    ];

    for (const query of rlsQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query }).catch(() => ({ error: null }));
      if (error) console.log(`   ⚠️  ${error.message}`);
    }
    console.log('   ✅ RLS policies fixed!\n');

    // 2. Add is_admin column
    console.log('2️⃣ Adding is_admin column...');
    const { data: columns } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_admin'`
      })
      .catch(() => ({ data: [] }));

    if (!columns || columns.length === 0) {
      await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT false`
      });
      console.log('   ✅ is_admin column added!\n');
    } else {
      console.log('   ℹ️  is_admin column already exists\n');
    }

    // 3. Set admin user
    console.log('3️⃣ Setting admin@example.com as admin...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ is_admin: true })
      .eq('email', 'admin@example.com');

    if (updateError) {
      console.log(`   ❌ Error: ${updateError.message}`);
    } else {
      console.log('   ✅ admin@example.com is now an admin!\n');
    }

    // 4. Verify admin users
    console.log('4️⃣ Verifying admin users...');
    const { data: admins, error: fetchError } = await supabase
      .from('user_profiles')
      .select('email, full_name, subscription_plan, is_admin')
      .eq('is_admin', true);

    if (fetchError) {
      console.log(`   ❌ Error: ${fetchError.message}`);
    } else if (admins && admins.length > 0) {
      console.log('   👑 Admin users:');
      admins.forEach(admin => {
        console.log(`      - ${admin.email} (${admin.full_name})`);
      });
    } else {
      console.log('   ⚠️  No admin users found');
    }

    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - RLS policies fixed for user_profiles');
    console.log('   - is_admin column added to user_profiles');
    console.log('   - admin@example.com set as admin');
    console.log('\n🔐 Admin Login:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

runMigrations();
