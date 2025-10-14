const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserProfile() {
  console.log('🔍 Testing user profile operations...');

  try {
    // Test inserting a user profile without authentication (should fail due to RLS)
    console.log('\n📝 Testing user profile insert without auth...');
    const testUserId = '12345678-1234-1234-1234-123456789012';
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User',
        subscription_plan: 'free',
      })
      .select()
      .single();

    if (error) {
      console.log('✅ RLS is working - insert blocked without auth:', error.message);
      console.log('Error code:', error.code);
    } else {
      console.log('⚠️  RLS might not be working - insert succeeded without auth');
    }

    // Test with service role key (admin access)
    console.log('\n🔑 Testing with service role key...');
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
        },
      });

      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: testUserId,
          email: 'test@example.com',
          full_name: 'Test User',
          subscription_plan: 'free',
        })
        .select()
        .single();

      if (adminError) {
        console.error('❌ Admin insert failed:', adminError.message);
      } else {
        console.log('✅ Admin insert successful:', adminData);
        
        // Clean up
        await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', testUserId);
        console.log('🧹 Test data cleaned up');
      }
    } else {
      console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not found - skipping admin test');
    }

    // Test authentication flow
    console.log('\n🔐 Testing authentication flow...');
    
    // Try to sign up a test user
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
        },
      },
    });

    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message);
    } else {
      console.log('✅ Sign up successful:', signUpData.user?.id);
      
      if (signUpData.user) {
        // Wait a moment for the user to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to create user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: signUpData.user.id,
            email: signUpData.user.email,
            full_name: 'Test User',
            subscription_plan: 'free',
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ Profile creation failed:', profileError.message);
          console.error('Error details:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          });
        } else {
          console.log('✅ Profile creation successful:', profileData);
          
          // Clean up
          await supabaseAdmin
            .from('user_profiles')
            .delete()
            .eq('id', signUpData.user.id);
          console.log('🧹 Test profile cleaned up');
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testUserProfile();
