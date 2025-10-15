const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function setupDemoUsers() {
  console.log('🔧 Setting up demo users...');

  const demoUsers = [
    {
      email: 'demo@scopemedia.com',
      password: 'demo123',
      full_name: 'Demo User',
      subscription_plan: 'free'
    },
    {
      email: 'admin@example.com',
      password: 'admin123',
      full_name: 'Admin User',
      subscription_plan: 'enterprise'
    }
  ];

  for (const userData of demoUsers) {
    try {
      console.log(`\n👤 Setting up user: ${userData.email}`);
      
      // Check if user already exists
      const { data: existingUsers, error: fetchError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('email', userData.email);

      if (fetchError) {
        console.error('Error checking existing users:', fetchError.message);
        continue;
      }

      if (existingUsers && existingUsers.length > 0) {
        console.log(`✅ User ${userData.email} already exists`);
        continue;
      }

      // Create user in auth.users
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          full_name: userData.full_name
        }
      });

      if (authError) {
        console.error(`❌ Error creating auth user ${userData.email}:`, authError.message);
        continue;
      }

      if (authData.user) {
        console.log(`✅ Auth user created: ${authData.user.id}`);

        // Create user profile
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            subscription_plan: userData.subscription_plan,
          })
          .select()
          .single();

        if (profileError) {
          console.error(`❌ Error creating profile for ${userData.email}:`, profileError.message);
        } else {
          console.log(`✅ Profile created for ${userData.email}`);
        }
      }

    } catch (error) {
      console.error(`❌ Error setting up ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Demo users setup complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('Email: demo@scopemedia.com');
  console.log('Password: demo123');
  console.log('\nAdmin Credentials:');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
}

setupDemoUsers();
