-- Add club_name column to startlist table
-- Run this migration to update the database

-- Add club_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'startlist' AND column_name = 'club_name'
    ) THEN
        ALTER TABLE startlist ADD COLUMN club_name TEXT;
        RAISE NOTICE 'Added club_name column to startlist table';
    ELSE
        RAISE NOTICE 'Club_name column already exists in startlist table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Club_name column is now available in the startlist table.';
END $$;
