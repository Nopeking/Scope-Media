const fs = require('fs');
const path = require('path');

/**
 * Run migration files against Supabase
 * Usage: node scripts/run-migration.js [migration-name]
 */
async function runMigration() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('📁 No migrations directory found. Create one with:');
    console.log('node scripts/create-migration.js "your-migration-name"');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('📁 No migration files found in migrations directory');
    return;
  }

  console.log('🔄 Available migrations:');
  migrationFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  const targetMigration = process.argv[2];
  
  if (targetMigration) {
    // Run specific migration
    const migrationFile = migrationFiles.find(file => file.includes(targetMigration));
    if (!migrationFile) {
      console.error(`❌ Migration not found: ${targetMigration}`);
      return;
    }
    await runSingleMigration(path.join(migrationsDir, migrationFile));
  } else {
    // Run all pending migrations
    console.log('\n🚀 Running all pending migrations...');
    for (const file of migrationFiles) {
      await runSingleMigration(path.join(migrationsDir, file));
    }
  }
}

async function runSingleMigration(migrationPath) {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const filename = path.basename(migrationPath);
  
  console.log(`\n📄 Running migration: ${filename}`);
  console.log('⚠️  Copy the SQL below and run it in your Supabase SQL Editor:');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('\n📋 Instructions:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Paste the SQL above');
  console.log('4. Click "Run" to execute');
  console.log('\n🔗 Dashboard URL: https://supabase.com/dashboard/project/lfvoeszwxkblygruyonm');
}

runMigration().catch(console.error);
