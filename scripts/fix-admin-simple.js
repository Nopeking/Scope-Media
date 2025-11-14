const { createClient } = require('@supabase/supabase-js');
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

async function fixAdmin() {
  console.log('🔧 Fixing admin access...\n');

  try {
    // Update admin user with is_admin flag
    console.log('Setting admin@example.com as admin...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ is_admin: true })
      .eq('email', 'admin@example.com');

    if (updateError) {
      console.log(`❌ Error: ${updateError.message}`);
      console.log('\n⚠️  The is_admin column might not exist yet.');
      console.log('📝 Please run this SQL in your Supabase dashboard:');
      console.log('\nALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;');
      console.log('UPDATE user_profiles SET is_admin = true WHERE email = \'admin@example.com\';');
      console.log('\n');
    } else {
      console.log('✅ admin@example.com is now an admin!\n');
    }

    // Verify
    console.log('Verifying admin users...');
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('email, full_name, subscription_plan, is_admin')
      .in('email', ['demo@scopemedia.com', 'admin@example.com']);

    if (fetchError) {
      console.log(`❌ Error: ${fetchError.message}`);
    } else if (users) {
      console.log('\n📋 Current users:');
      users.forEach(user => {
        const adminBadge = user.is_admin ? '👑 ADMIN' : '👤';
        console.log(`   ${adminBadge} ${user.email} (${user.full_name}) - ${user.subscription_plan}`);
      });
    }

    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Demo:  demo@scopemedia.com / demo123');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdmin();
