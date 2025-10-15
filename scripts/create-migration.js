const fs = require('fs');
const path = require('path');

/**
 * Create a new migration file
 * Usage: node scripts/create-migration.js "add-user-preferences-table"
 */
function createMigration() {
  const migrationName = process.argv[2];
  
  if (!migrationName) {
    console.error('❌ Please provide a migration name');
    console.log('Usage: node scripts/create-migration.js "migration-name"');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${timestamp}_${migrationName}.sql`;
  const filepath = path.join(__dirname, 'migrations', filename);

  // Create migrations directory if it doesn't exist
  const migrationsDir = path.dirname(filepath);
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  // Create migration template
  const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your SQL changes here
-- Example:
-- ALTER TABLE streams ADD COLUMN description TEXT;

-- Example: Create new table
-- CREATE TABLE example_table (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   name TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Example: Add indexes
-- CREATE INDEX IF NOT EXISTS idx_example_name ON example_table(name);

-- Example: Add RLS policies
-- ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON example_table FOR SELECT USING (true);
`;

  fs.writeFileSync(filepath, template);
  console.log(`✅ Created migration: ${filename}`);
  console.log(`📁 Location: ${filepath}`);
  console.log('\n📝 Next steps:');
  console.log('1. Edit the migration file with your SQL changes');
  console.log('2. Run: node scripts/run-migration.js');
}

createMigration();
