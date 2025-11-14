-- Migration: Add scoring_password column to classes table
-- Date: 2024
-- Description: Adds scoring_password column to classes table for public scoring page password protection

-- Add scoring_password column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'classes' 
        AND column_name = 'scoring_password'
    ) THEN
        ALTER TABLE classes ADD COLUMN scoring_password TEXT;
        RAISE NOTICE 'Column scoring_password added to classes table';
    ELSE
        RAISE NOTICE 'Column scoring_password already exists in classes table';
    END IF;
END $$;

