# Supabase Setup Guide

This guide will help you set up Supabase for your media platform project.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `media-platform` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase-schema.sql` from your project
4. Click "Run" to execute the SQL

This will create:
- `streams` table for live streams
- `archived_videos` table for video content
- `custom_titles` table for custom categories
- Proper indexes and Row Level Security policies

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:3000/admin/dashboard`

3. Try adding a new stream, video, or custom title through the admin interface

4. Check your Supabase dashboard → **Table Editor** to see the data being created

## Step 6: Verify Everything Works

### Test Streams
- Add a new live stream
- Check it appears in the streams table
- Try deleting a stream

### Test Videos
- Add a new archived video
- Check it appears in the archived_videos table
- Try deleting a video

### Test Custom Titles
- Add a new custom title
- Check it appears in the custom_titles table
- Try deleting a title

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your environment variables
   - Make sure there are no extra spaces or quotes
   - Restart your development server after changing `.env.local`

2. **"Table doesn't exist" error**
   - Make sure you ran the SQL schema in Step 4
   - Check that the table names match exactly

3. **"Permission denied" error**
   - Check your Row Level Security policies in Supabase
   - Make sure the policies allow the operations you're trying to perform

4. **Data not appearing**
   - Check the browser console for errors
   - Verify your API routes are working by testing them directly
   - Check the Supabase logs in the dashboard

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Look at the browser console for error messages
- Check the Supabase dashboard logs
- Verify your environment variables are correct

## Next Steps

Once everything is working:

1. **Set up authentication** (if needed) using Supabase Auth
2. **Configure proper RLS policies** based on your security requirements
3. **Set up real-time subscriptions** for live updates
4. **Add data validation** in your API routes
5. **Set up backups** and monitoring

## File Structure

The following files have been created/modified for Supabase integration:

- `src/lib/supabase.ts` - Supabase client configuration
- `src/types/index.ts` - Updated with Supabase types
- `src/app/api/streams/route.ts` - Updated to use Supabase
- `src/app/api/videos/route.ts` - Updated to use Supabase
- `src/app/api/titles/route.ts` - Updated to use Supabase
- `supabase-schema.sql` - Database schema
- `.env.local` - Environment variables (you need to fill this in)

Your media platform is now powered by Supabase! 🎉
