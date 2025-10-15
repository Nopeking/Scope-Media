/**
 * Migration script to move data from JSON files to Supabase
 * Run this after setting up Supabase to migrate existing data
 */

const fs = require('fs');
const path = require('path');

// You'll need to install dotenv: npm install dotenv
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateData() {
  console.log('🚀 Starting migration to Supabase...');

  try {
    // Migrate custom titles
    console.log('📝 Migrating custom titles...');
    const titlesPath = path.join(process.cwd(), 'data', 'titles.json');
    
    if (fs.existsSync(titlesPath)) {
      const titles = JSON.parse(fs.readFileSync(titlesPath, 'utf-8'));
      
      for (const title of titles) {
        const { error } = await supabase
          .from('custom_titles')
          .insert({ title });
        
        if (error && !error.message.includes('duplicate key')) {
          console.error(`❌ Error inserting title "${title}":`, error.message);
        } else {
          console.log(`✅ Migrated title: "${title}"`);
        }
      }
    }

    // Migrate streams
    console.log('📝 Migrating streams...');
    const streamsPath = path.join(process.cwd(), 'data', 'streams.json');
    
    if (fs.existsSync(streamsPath)) {
      const streams = JSON.parse(fs.readFileSync(streamsPath, 'utf-8'));
      
      for (const stream of streams) {
        const { error } = await supabase
          .from('streams')
          .insert({
            title: stream.title,
            url: stream.url,
            status: stream.status || 'inactive',
            thumbnail: stream.thumbnail || null,
            viewers: stream.viewers || 0
          });
        
        if (error) {
          console.error(`❌ Error inserting stream "${stream.title}":`, error.message);
        } else {
          console.log(`✅ Migrated stream: "${stream.title}"`);
        }
      }
    }

    // Migrate videos
    console.log('📝 Migrating videos...');
    const videosPath = path.join(process.cwd(), 'data', 'videos.json');
    
    if (fs.existsSync(videosPath)) {
      const videos = JSON.parse(fs.readFileSync(videosPath, 'utf-8'));
      
      for (const video of videos) {
        const { error } = await supabase
          .from('archived_videos')
          .insert({
            title: video.title,
            url: video.url,
            duration: video.duration || null,
            upload_date: video.uploadDate ? new Date(video.uploadDate).toISOString() : new Date().toISOString(),
            custom_title: video.customTitle,
            thumbnail: video.thumbnail || null
          });
        
        if (error) {
          console.error(`❌ Error inserting video "${video.title}":`, error.message);
        } else {
          console.log(`✅ Migrated video: "${video.title}"`);
        }
      }
    }

    console.log('🎉 Migration completed successfully!');
    console.log('You can now delete the data/ folder if everything looks good.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
