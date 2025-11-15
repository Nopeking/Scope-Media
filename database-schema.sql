-- ============================================================================
-- Complete Database Schema for Media Platform
-- All tables, indexes, RLS policies, and initial data
-- Safe to run multiple times (idempotent)
-- ============================================================================

-- ============================================================================
-- CORE TABLES: Streams, Videos, and Custom Titles
-- ============================================================================

-- Create the streams table
CREATE TABLE IF NOT EXISTS streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'scheduled')),
  thumbnail TEXT,
  viewers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the archived_videos table
CREATE TABLE IF NOT EXISTS archived_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  duration TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  custom_title TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the custom_titles table
CREATE TABLE IF NOT EXISTS custom_titles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for streams and videos
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_created_at ON streams(created_at);
CREATE INDEX IF NOT EXISTS idx_archived_videos_upload_date ON archived_videos(upload_date);
CREATE INDEX IF NOT EXISTS idx_archived_videos_custom_title ON archived_videos(custom_title);

-- ============================================================================
-- USER TABLES: Profiles, Library, and Preferences
-- ============================================================================

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'enterprise')),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_library table for personal content
CREATE TABLE IF NOT EXISTS user_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'photo', 'document')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER, -- in bytes
  duration TEXT, -- for videos
  tags TEXT[], -- array of tags
  is_public BOOLEAN DEFAULT false,
  uploaded_by_admin BOOLEAN DEFAULT false,
  admin_uploader_id UUID REFERENCES auth.users(id), -- admin who uploaded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_library_sharing table for sharing content
CREATE TABLE IF NOT EXISTS user_library_sharing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  library_item_id UUID REFERENCES user_library(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'download', 'edit')),
  shared_by_user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(library_item_id, shared_with_user_id)
);

-- Create user_preferences table for storing user-specific settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de')),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  auto_play BOOLEAN DEFAULT false,
  video_quality TEXT DEFAULT 'auto' CHECK (video_quality IN ('auto', '720p', '1080p', '4k')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for user tables
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_content_type ON user_library(content_type);
CREATE INDEX IF NOT EXISTS idx_user_library_created_at ON user_library(created_at);
CREATE INDEX IF NOT EXISTS idx_user_library_sharing_shared_with ON user_library_sharing(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences(theme);

-- ============================================================================
-- RIDER TABLES: Riders, User-Rider Links, and Rider Library
-- ============================================================================

-- Create riders table for equestrian rider data
CREATE TABLE IF NOT EXISTS riders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE, -- ID from the external API (e.g., "S0000038")
  licence TEXT, -- Licence number (e.g., "EEF-SJR-0000038")
  licence_year INTEGER, -- Licence year
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT, -- home_phone from API
  address TEXT,
  zipcode TEXT,
  city TEXT,
  address_country TEXT,
  country TEXT, -- Nationality code (e.g., "UAE", "GBR")
  club_id TEXT, -- Club ID from API
  club_name TEXT, -- Club name
  fei_registration TEXT, -- FEI Registration number
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB, -- Store full API response for reference
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_riders table to link users to their rider profiles
CREATE TABLE IF NOT EXISTS user_riders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rider_id UUID REFERENCES riders(id) ON DELETE CASCADE NOT NULL,
  verified BOOLEAN DEFAULT false,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, rider_id)
);

-- Create rider_library table for storing media associated with riders
-- Users can view this library if they have linked to the rider
CREATE TABLE IF NOT EXISTS rider_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID REFERENCES riders(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'photo', 'document')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  duration TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  uploaded_by_admin UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for riders tables
CREATE INDEX IF NOT EXISTS idx_riders_external_id ON riders(external_id);
CREATE INDEX IF NOT EXISTS idx_riders_licence ON riders(licence);
CREATE INDEX IF NOT EXISTS idx_riders_fei_registration ON riders(fei_registration);
CREATE INDEX IF NOT EXISTS idx_riders_club_id ON riders(club_id);
CREATE INDEX IF NOT EXISTS idx_riders_club_name ON riders(club_name);
CREATE INDEX IF NOT EXISTS idx_riders_country ON riders(country);
CREATE INDEX IF NOT EXISTS idx_riders_is_active ON riders(is_active);
CREATE INDEX IF NOT EXISTS idx_riders_last_synced_at ON riders(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_riders_licence_year ON riders(licence_year);
CREATE INDEX IF NOT EXISTS idx_user_riders_user_id ON user_riders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_riders_rider_id ON user_riders(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_library_rider_id ON rider_library(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_library_content_type ON rider_library(content_type);
CREATE INDEX IF NOT EXISTS idx_rider_library_uploaded_at ON rider_library(uploaded_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_library ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP EXISTING POLICIES (to avoid conflicts when re-running)
-- ============================================================================

-- Streams policies
DROP POLICY IF EXISTS "Allow public read access to streams" ON streams;
DROP POLICY IF EXISTS "Allow all operations on streams" ON streams;

-- Archived videos policies
DROP POLICY IF EXISTS "Allow public read access to archived_videos" ON archived_videos;
DROP POLICY IF EXISTS "Allow all operations on archived_videos" ON archived_videos;

-- Custom titles policies
DROP POLICY IF EXISTS "Allow public read access to custom_titles" ON custom_titles;
DROP POLICY IF EXISTS "Allow all operations on custom_titles" ON custom_titles;

-- User profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- User library policies
DROP POLICY IF EXISTS "Users can view their own library" ON user_library;
DROP POLICY IF EXISTS "Users can insert into their own library" ON user_library;
DROP POLICY IF EXISTS "Users can update their own library" ON user_library;
DROP POLICY IF EXISTS "Users can delete their own library" ON user_library;
DROP POLICY IF EXISTS "Admins can manage all libraries" ON user_library;

-- User library sharing policies
DROP POLICY IF EXISTS "Users can view shared content" ON user_library_sharing;
DROP POLICY IF EXISTS "Users can share their content" ON user_library_sharing;

-- User preferences policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

-- Riders policies
DROP POLICY IF EXISTS "Allow public read access to riders" ON riders;
DROP POLICY IF EXISTS "Allow all operations on riders" ON riders;

-- User riders policies
DROP POLICY IF EXISTS "Users can view their own rider links" ON user_riders;
DROP POLICY IF EXISTS "Users can create their own rider links" ON user_riders;
DROP POLICY IF EXISTS "Users can delete their own rider links" ON user_riders;
DROP POLICY IF EXISTS "Admins can view all links" ON user_riders;
DROP POLICY IF EXISTS "Admins can delete rider links" ON user_riders;

-- Rider library policies
DROP POLICY IF EXISTS "Users can view linked rider library" ON rider_library;
DROP POLICY IF EXISTS "Admins can manage all rider library" ON rider_library;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- --------------------------------------------------------------------------
-- Streams Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to streams"
  ON streams FOR SELECT USING (true);

CREATE POLICY "Allow all operations on streams"
  ON streams FOR ALL USING (true);

-- --------------------------------------------------------------------------
-- Archived Videos Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to archived_videos"
  ON archived_videos FOR SELECT USING (true);

CREATE POLICY "Allow all operations on archived_videos"
  ON archived_videos FOR ALL USING (true);

-- --------------------------------------------------------------------------
-- Custom Titles Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to custom_titles"
  ON custom_titles FOR SELECT USING (true);

CREATE POLICY "Allow all operations on custom_titles"
  ON custom_titles FOR ALL USING (true);

-- --------------------------------------------------------------------------
-- User Profiles Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- --------------------------------------------------------------------------
-- User Library Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Users can view their own library"
  ON user_library FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own library"
  ON user_library FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own library"
  ON user_library FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own library"
  ON user_library FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all libraries"
  ON user_library FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

-- --------------------------------------------------------------------------
-- User Library Sharing Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Users can view shared content"
  ON user_library_sharing FOR SELECT USING (
    auth.uid() = shared_with_user_id OR
    auth.uid() = shared_by_user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

CREATE POLICY "Users can share their content"
  ON user_library_sharing FOR INSERT WITH CHECK (
    auth.uid() = shared_by_user_id AND
    EXISTS (
      SELECT 1 FROM user_library
      WHERE id = library_item_id AND user_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- User Preferences Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- Riders Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to riders"
  ON riders FOR SELECT USING (true);

CREATE POLICY "Allow all operations on riders"
  ON riders FOR ALL USING (true);

-- --------------------------------------------------------------------------
-- User Riders Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Users can view their own rider links"
  ON user_riders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rider links"
  ON user_riders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rider links"
  ON user_riders FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all links"
  ON user_riders FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

CREATE POLICY "Admins can delete rider links"
  ON user_riders FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

-- --------------------------------------------------------------------------
-- Rider Library Policies
-- --------------------------------------------------------------------------
-- Users can view library items for riders they have linked
CREATE POLICY "Users can view linked rider library"
  ON rider_library FOR SELECT USING (
    rider_id IN (
      SELECT rider_id
      FROM user_riders
      WHERE user_id = auth.uid()
    )
  );

-- Admins (enterprise users) can manage all rider library items
CREATE POLICY "Admins can manage all rider library"
  ON rider_library FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON rider_library TO authenticated;
GRANT ALL ON rider_library TO service_role;

-- ============================================================================
-- SHOWS TABLES: Show Jumping Competition Management
-- ============================================================================

-- Create shows table
CREATE TABLE IF NOT EXISTS shows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  show_type TEXT NOT NULL CHECK (show_type IN ('national', 'international')),
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  class_name TEXT NOT NULL,
  class_rule TEXT NOT NULL CHECK (class_rule IN (
    'one_round_against_clock',
    'one_round_not_against_clock',
    'optimum_time',
    'special_two_phases',
    'two_phases',
    'one_round_with_jumpoff',
    'two_rounds_with_tiebreaker',
    'two_rounds_team_with_tiebreaker',
    'accumulator',
    'speed_and_handiness',
    'six_bars'
  )),
  class_type TEXT,
  height TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'AED',
  class_date DATE,
  start_time TIME,
  time_allowed INTEGER,
  time_allowed_round2 INTEGER,
  optimum_time INTEGER,
  max_points INTEGER DEFAULT 65,
  number_of_rounds INTEGER DEFAULT 1,
  linked_stream_id UUID REFERENCES streams(id),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  scoring_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add scoring_password column to classes if it doesn't exist
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
    END IF;
END $$;

-- Create startlist table
CREATE TABLE IF NOT EXISTS startlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  rider_name TEXT NOT NULL,
  rider_id TEXT,
  fei_id TEXT,
  license TEXT,
  horse_name TEXT NOT NULL,
  horse_id TEXT,
  team_name TEXT,
  club_name TEXT,
  start_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to startlist table if they don't exist
DO $$ 
BEGIN
    -- Add fei_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'startlist' 
        AND column_name = 'fei_id'
    ) THEN
        ALTER TABLE startlist ADD COLUMN fei_id TEXT;
        RAISE NOTICE 'Column fei_id added to startlist table';
    END IF;

    -- Add license column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'startlist' 
        AND column_name = 'license'
    ) THEN
        ALTER TABLE startlist ADD COLUMN license TEXT;
        RAISE NOTICE 'Column license added to startlist table';
    END IF;

    -- Add club_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'startlist' 
        AND column_name = 'club_name'
    ) THEN
        ALTER TABLE startlist ADD COLUMN club_name TEXT;
        RAISE NOTICE 'Column club_name added to startlist table';
    END IF;

    -- Ensure rider_id allows NULL (drop NOT NULL constraint if it exists)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'startlist' 
        AND column_name = 'rider_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE startlist ALTER COLUMN rider_id DROP NOT NULL;
        RAISE NOTICE 'NOT NULL constraint removed from rider_id column';
    END IF;
END $$;

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startlist_id UUID REFERENCES startlist(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER DEFAULT 1,
  time_taken DECIMAL(10, 2),
  time_faults INTEGER DEFAULT 0,
  jumping_faults INTEGER DEFAULT 0,
  total_faults INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'completed', 'cancelled', 'retired', 'eliminated', 'withdrawn'
  )),
  is_jumpoff BOOLEAN DEFAULT false,
  qualified_for_jumpoff BOOLEAN DEFAULT false,
  rank INTEGER,
  final_time DECIMAL(10, 2),
  notes TEXT,
  scored_by UUID REFERENCES auth.users(id),
  scored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_scores table
CREATE TABLE IF NOT EXISTS team_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  round_number INTEGER DEFAULT 1,
  total_faults INTEGER DEFAULT 0,
  total_time DECIMAL(10, 2) DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for shows tables
CREATE INDEX IF NOT EXISTS idx_shows_start_date ON shows(start_date);
CREATE INDEX IF NOT EXISTS idx_shows_status ON shows(status);
CREATE INDEX IF NOT EXISTS idx_shows_show_type ON shows(show_type);
CREATE INDEX IF NOT EXISTS idx_classes_show_id ON classes(show_id);
CREATE INDEX IF NOT EXISTS idx_classes_class_date ON classes(class_date);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_class_rule ON classes(class_rule);
CREATE INDEX IF NOT EXISTS idx_startlist_class_id ON startlist(class_id);
CREATE INDEX IF NOT EXISTS idx_startlist_rider_id ON startlist(rider_id);
CREATE INDEX IF NOT EXISTS idx_startlist_start_order ON startlist(start_order);
CREATE INDEX IF NOT EXISTS idx_scores_startlist_id ON scores(startlist_id);
CREATE INDEX IF NOT EXISTS idx_scores_class_id ON scores(class_id);
CREATE INDEX IF NOT EXISTS idx_scores_round_number ON scores(round_number);
CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores(rank);
CREATE INDEX IF NOT EXISTS idx_team_scores_class_id ON team_scores(class_id);
CREATE INDEX IF NOT EXISTS idx_team_scores_team_name ON team_scores(team_name);

-- Enable Row Level Security on shows tables
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE startlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing shows policies
DROP POLICY IF EXISTS "Allow public read access to shows" ON shows;
DROP POLICY IF EXISTS "Allow public read access to classes" ON classes;
DROP POLICY IF EXISTS "Allow public read access to startlist" ON startlist;
DROP POLICY IF EXISTS "Allow public read access to scores" ON scores;
DROP POLICY IF EXISTS "Allow public read access to team_scores" ON team_scores;
DROP POLICY IF EXISTS "Admins can manage shows" ON shows;
DROP POLICY IF EXISTS "Admins can manage classes" ON classes;
DROP POLICY IF EXISTS "Admins can manage startlist" ON startlist;
DROP POLICY IF EXISTS "Admins can manage scores" ON scores;
DROP POLICY IF EXISTS "Admins can manage team_scores" ON team_scores;

-- --------------------------------------------------------------------------
-- Shows Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to shows"
  ON shows FOR SELECT USING (true);

CREATE POLICY "Admins can manage shows"
  ON shows FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

-- --------------------------------------------------------------------------
-- Classes Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to classes"
  ON classes FOR SELECT USING (true);

CREATE POLICY "Admins can manage classes"
  ON classes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

-- --------------------------------------------------------------------------
-- Startlist Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to startlist"
  ON startlist FOR SELECT USING (true);

CREATE POLICY "Admins can manage startlist"
  ON startlist FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

-- --------------------------------------------------------------------------
-- Scores Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to scores"
  ON scores FOR SELECT USING (true);

CREATE POLICY "Admins can manage scores"
  ON scores FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

-- --------------------------------------------------------------------------
-- Team Scores Policies
-- --------------------------------------------------------------------------
CREATE POLICY "Allow public read access to team_scores"
  ON team_scores FOR SELECT USING (true);

CREATE POLICY "Admins can manage team_scores"
  ON team_scores FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND subscription_plan = 'enterprise'
    )
  );

-- Grant permissions for shows tables
GRANT SELECT ON shows TO authenticated;
GRANT SELECT ON classes TO authenticated;
GRANT SELECT ON startlist TO authenticated;
GRANT SELECT ON scores TO authenticated;
GRANT SELECT ON team_scores TO authenticated;
GRANT ALL ON shows TO service_role;
GRANT ALL ON classes TO service_role;
GRANT ALL ON startlist TO service_role;
GRANT ALL ON scores TO service_role;
GRANT ALL ON team_scores TO service_role;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert some sample custom titles (safe to run multiple times)
INSERT INTO custom_titles (title) VALUES
  ('Tech Conferences'),
  ('Cooking Shows'),
  ('Music Events')
ON CONFLICT (title) DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created/updated successfully!';
    RAISE NOTICE 'All tables, indexes, and RLS policies have been configured.';
END $$;
