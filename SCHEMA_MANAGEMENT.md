# 🗄️ Supabase Schema Management Guide

This guide explains how to update and manage your Supabase database schema.

## 📋 Quick Reference

### **Available Commands:**
```bash
# Create a new migration
npm run migration:create "your-migration-name"

# Run all pending migrations
npm run migration:run

# Run specific migration
npm run migration:run "migration-name"
```

## 🎯 Methods to Update Schema

### **Method 1: Dashboard (Quick Changes)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/lfvoeszwxkblygruyonm)
2. Click **SQL Editor** → **New query**
3. Paste your SQL and click **Run**

### **Method 2: Migration System (Recommended)**
1. Create migration: `npm run migration:create "add-new-feature"`
2. Edit the generated file in `scripts/migrations/`
3. Run migration: `npm run migration:run`
4. Copy the SQL to Supabase Dashboard and execute

## 📁 Current Schema Structure

### **Schema Files:**
- `supabase-schema.sql` - Original schema (may have conflicts if run multiple times)
- `supabase-schema-safe.sql` - **Recommended** - Safe to run multiple times

### **Tables:**
- `streams` - Live streaming data
- `archived_videos` - Video content library
- `custom_titles` - Custom video categories
- `user_profiles` - User account information
- `user_library` - Personal content libraries
- `user_library_sharing` - Content sharing between users

### **Key Features:**
- ✅ Row Level Security (RLS) enabled
- ✅ Proper indexes for performance
- ✅ User authentication integration
- ✅ Admin access controls

## 🔧 Common Schema Updates

### **Add New Column:**
```sql
ALTER TABLE streams ADD COLUMN description TEXT;
ALTER TABLE streams ADD COLUMN category TEXT DEFAULT 'general';
```

### **Create New Table:**
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their notifications" ON notifications 
FOR ALL USING (auth.uid() = user_id);
```

### **Add Indexes:**
```sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
```

### **Update Existing Data:**
```sql
UPDATE streams SET description = 'No description' WHERE description IS NULL;
UPDATE user_profiles SET subscription_plan = 'free' WHERE subscription_plan IS NULL;
```

## 🚨 Important Notes

### **Before Making Changes:**
1. **Backup your data** if making destructive changes
2. **Test on development** environment first
3. **Use transactions** for complex changes
4. **Check RLS policies** after schema changes

### **Best Practices:**
- Use `IF NOT EXISTS` for table/column creation
- Always add appropriate indexes
- Enable RLS on new tables
- Test queries after schema changes
- Document changes in migration comments

## 🔗 Useful Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/lfvoeszwxkblygruyonm
- **SQL Editor**: https://supabase.com/dashboard/project/lfvoeszwxkblygruyonm/sql
- **Table Editor**: https://supabase.com/dashboard/project/lfvoeszwxkblygruyonm/editor
- **Database Schema**: https://supabase.com/dashboard/project/lfvoeszwxkblygruyonm/schema

## 📝 Migration Examples

### **Example 1: Add User Preferences**
```bash
npm run migration:create "add-user-preferences"
```
Then edit the migration file with:
```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Example 2: Add Video Analytics**
```bash
npm run migration:create "add-video-analytics"
```
Then edit the migration file with:
```sql
CREATE TABLE video_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES archived_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  watch_duration INTEGER, -- seconds
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛠️ Troubleshooting

### **Common Issues:**
1. **RLS blocking queries**: Check policies and user authentication
2. **Missing indexes**: Add indexes for frequently queried columns
3. **Foreign key constraints**: Ensure referenced tables exist
4. **Permission errors**: Verify user has proper database permissions

### **Debug Steps:**
1. Check Supabase logs in dashboard
2. Test queries in SQL Editor first
3. Verify environment variables are set
4. Check RLS policies are correctly configured
