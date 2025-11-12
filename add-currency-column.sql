-- Add currency and start_time columns to existing classes table
-- Run this migration to update the database

-- Add currency column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'classes' AND column_name = 'currency'
    ) THEN
        ALTER TABLE classes ADD COLUMN currency TEXT DEFAULT 'AED';
        RAISE NOTICE 'Added currency column to classes table';
    ELSE
        RAISE NOTICE 'Currency column already exists in classes table';
    END IF;
END $$;

-- Add start_time column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'classes' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE classes ADD COLUMN start_time TIME;
        RAISE NOTICE 'Added start_time column to classes table';
    ELSE
        RAISE NOTICE 'Start_time column already exists in classes table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Currency and start_time columns are now available in the classes table.';
END $$;
