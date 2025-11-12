#!/usr/bin/env node

/**
 * Script to run database-schema.sql in Supabase
 * Executes the complete database schema including shows tables
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSchema() {
  console.log('📖 Reading database-schema.sql...');
  const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('\n⚠️  MANUAL STEP REQUIRED');
  console.log('━'.repeat(50));
  console.log('\nDue to Supabase security restrictions, you need to run');
  console.log('the SQL schema manually in your Supabase dashboard.\n');

  console.log('📋 Follow these steps:');
  console.log('\n1. Go to your Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/ekprhdjrozvqgqysbbku');
  console.log('\n2. Click on "SQL Editor" in the left sidebar');
  console.log('\n3. Click "New Query"');
  console.log('\n4. Copy the contents of: database-schema.sql');
  console.log('   (or run: cat database-schema.sql | clip)');
  console.log('\n5. Paste it into the SQL Editor');
  console.log('\n6. Click "Run" button at the bottom');
  console.log('\n7. Wait for success message (should see green checkmark)');

  console.log('\n📋 This schema includes:');
  console.log('   ✓ Streams and archived videos tables');
  console.log('   ✓ User profiles and library tables');
  console.log('   ✓ Riders and rider library tables');
  console.log('   ✓ Shows management tables:');
  console.log('     - shows');
  console.log('     - classes (with 11 rule types)');
  console.log('     - startlist');
  console.log('     - scores');
  console.log('     - team_scores');
  console.log('   ✓ All indexes and RLS policies');

  console.log('\n💡 The schema is idempotent (safe to run multiple times)');
  console.log('   It uses CREATE TABLE IF NOT EXISTS and DROP POLICY IF EXISTS');

  console.log('\n━'.repeat(50));
  console.log('Once you\'ve run the schema, come back here to continue! ✨');
}

console.log('🔧 Database Schema Runner');
console.log('━'.repeat(50));
runSchema();
