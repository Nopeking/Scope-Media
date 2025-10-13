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

-- Create policies for public read access (you can modify these based on your auth requirements)
CREATE POLICY "Allow public read access to streams" ON streams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to archived_videos" ON archived_videos FOR SELECT USING (true);
CREATE POLICY "Allow public read access to custom_titles" ON custom_titles FOR SELECT USING (true);

-- Create policies for admin write access (you'll need to implement proper admin authentication)
-- For now, we'll allow all operations - you should restrict this based on your auth system
CREATE POLICY "Allow all operations on streams" ON streams FOR ALL USING (true);
CREATE POLICY "Allow all operations on archived_videos" ON archived_videos FOR ALL USING (true);
CREATE POLICY "Allow all operations on custom_titles" ON custom_titles FOR ALL USING (true);

-- Insert some sample data
INSERT INTO custom_titles (title) VALUES 
  ('Tech Conferences'),
  ('Cooking Shows'),
  ('Music Events')
ON CONFLICT (title) DO NOTHING;
