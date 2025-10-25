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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_created_at ON streams(created_at);
CREATE INDEX IF NOT EXISTS idx_archived_videos_upload_date ON archived_videos(upload_date);
CREATE INDEX IF NOT EXISTS idx_archived_videos_custom_title ON archived_videos(custom_title);

-- Enable Row Level Security (RLS)
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_titles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to streams" ON streams;
DROP POLICY IF EXISTS "Allow public read access to archived_videos" ON archived_videos;
DROP POLICY IF EXISTS "Allow public read access to custom_titles" ON custom_titles;
DROP POLICY IF EXISTS "Allow all operations on streams" ON streams;
DROP POLICY IF EXISTS "Allow all operations on archived_videos" ON archived_videos;
DROP POLICY IF EXISTS "Allow all operations on custom_titles" ON custom_titles;

-- Create policies for public read access (you can modify these based on your auth requirements)
CREATE POLICY "Allow public read access to streams" ON streams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to archived_videos" ON archived_videos FOR SELECT USING (true);
CREATE POLICY "Allow public read access to custom_titles" ON custom_titles FOR SELECT USING (true);

-- Create policies for admin write access (you'll need to implement proper admin authentication)
-- For now, we'll allow all operations - you should restrict this based on your auth system
CREATE POLICY "Allow all operations on streams" ON streams FOR ALL USING (true);
CREATE POLICY "Allow all operations on archived_videos" ON archived_videos FOR ALL USING (true);
CREATE POLICY "Allow all operations on custom_titles" ON custom_titles FOR ALL USING (true);

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'enterprise')),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_content_type ON user_library(content_type);
CREATE INDEX IF NOT EXISTS idx_user_library_created_at ON user_library(created_at);
CREATE INDEX IF NOT EXISTS idx_user_library_sharing_shared_with ON user_library_sharing(shared_with_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_sharing ENABLE ROW LEVEL SECURITY;

-- Drop existing user policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own library" ON user_library;
DROP POLICY IF EXISTS "Users can insert into their own library" ON user_library;
DROP POLICY IF EXISTS "Users can update their own library" ON user_library;
DROP POLICY IF EXISTS "Users can delete their own library" ON user_library;
DROP POLICY IF EXISTS "Admins can manage all libraries" ON user_library;

DROP POLICY IF EXISTS "Users can view shared content" ON user_library_sharing;
DROP POLICY IF EXISTS "Users can share their content" ON user_library_sharing;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User library policies
CREATE POLICY "Users can view their own library" ON user_library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own library" ON user_library FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own library" ON user_library FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own library" ON user_library FOR DELETE USING (auth.uid() = user_id);

-- Allow admins to manage any user's library (you'll need to implement admin role checking)
CREATE POLICY "Admins can manage all libraries" ON user_library FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND subscription_plan = 'enterprise' -- or implement proper admin role
  )
);

-- User library sharing policies
CREATE POLICY "Users can view shared content" ON user_library_sharing FOR SELECT USING (
  auth.uid() = shared_with_user_id OR 
  auth.uid() = shared_by_user_id OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND subscription_plan = 'enterprise'
  )
);

CREATE POLICY "Users can share their content" ON user_library_sharing FOR INSERT WITH CHECK (
  auth.uid() = shared_by_user_id AND
  EXISTS (
    SELECT 1 FROM user_library 
    WHERE id = library_item_id AND user_id = auth.uid()
  )
);

-- Insert some sample data
INSERT INTO custom_titles (title) VALUES
  ('Tech Conferences'),
  ('Cooking Shows'),
  ('Music Events')
ON CONFLICT (title) DO NOTHING;
