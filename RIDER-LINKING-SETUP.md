# Rider Linking Feature - Setup Guide

## Overview

Users can now link their rider profiles by entering their FEI Registration number. This feature allows riders in your database to claim their profiles and associate them with their user accounts.

## What Was Implemented

### 1. Database Schema
- Created `user_riders` table to link users to riders
- Fields: user_id, rider_id, verified, linked_at
- Includes RLS policies for security

### 2. API Endpoints
Created `/api/riders/link` with three methods:
- **POST** - Link a rider by FEI Registration number
- **GET** - Get all linked riders for a user
- **DELETE** - Unlink a rider

### 3. User Interface
Created `/profile/link-rider` page where users can:
- Enter their FEI Registration number
- View all their linked rider profiles
- Unlink riders if needed
- See verification status

## Setup Steps

### Step 1: Apply Database Schema

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (ekprhdjrozvqgqysbbku)
3. Go to **SQL Editor**
4. Open and run the file: `add-user-riders-table.sql`
5. Click "Run" to create the table

### Step 2: Verify Schema

Run the test script to verify the table was created:

```bash
node test-user-riders-schema.js
```

You should see:
```
✅ user_riders table exists!
✅ Current links in database: 0
```

### Step 3: Ensure Riders Data Exists

Before users can link their profiles, you need riders in the database:

**Option A: Sync from API (if the endpoint is fixed)**
1. Go to http://localhost:3000/admin/riders
2. Click "Sync Riders from API"

**Option B: Manual Import**
1. Prepare your rider data in JSON format
2. Use the import endpoint:

```bash
curl -X POST http://localhost:3000/api/riders/import \
  -H "Content-Type: application/json" \
  -d '{
    "riders": [
      {
        "id": "S0000001",
        "first_name": "John",
        "last_name": "Doe",
        "FEIRegistration": "10012345",
        "licence": "EEF-SJR-0000001",
        "licence_year": 2024,
        "email": "john@example.com",
        "country": "UAE",
        "club_id": "C001",
        "club_name": "Dubai Equestrian Club"
      }
    ]
  }'
```

### Step 4: Test the Linking Feature

1. Make sure you're logged in to the application
2. Visit: http://localhost:3000/profile/link-rider
3. Enter a valid FEI Registration number from your database
4. Click "Link Rider"

## How It Works

### For Users

1. User logs in to the application
2. Navigates to `/profile/link-rider`
3. Enters their FEI Registration number
4. System searches for matching rider in database
5. If found, creates a link between user and rider
6. User can now see their rider profile information
7. Link can be verified by an admin later

### For Admins

Admins (users with 'enterprise' subscription plan) can:
- View all user-rider links
- Verify links (you may want to add an admin UI for this)
- Manage rider data through `/admin/riders`

## API Usage Examples

### Link a Rider

```javascript
POST /api/riders/link
Content-Type: application/json

{
  "fei_registration": "10012345",
  "user_id": "uuid-of-current-user"
}

Response:
{
  "success": true,
  "message": "Rider successfully linked to your account",
  "rider": { ... },
  "link": { ... }
}
```

### Get User's Linked Riders

```javascript
GET /api/riders/link?user_id=uuid-of-user

Response:
{
  "success": true,
  "links": [
    {
      "id": "link-uuid",
      "user_id": "user-uuid",
      "rider_id": "rider-uuid",
      "verified": false,
      "linked_at": "2024-01-15T10:30:00Z",
      "riders": {
        "id": "rider-uuid",
        "full_name": "John Doe",
        "fei_registration": "10012345",
        ...
      }
    }
  ]
}
```

### Unlink a Rider

```javascript
DELETE /api/riders/link?link_id=link-uuid&user_id=user-uuid

Response:
{
  "success": true,
  "message": "Rider successfully unlinked"
}
```

## Security Features

1. **Row Level Security (RLS)**: Users can only see and manage their own links
2. **User ID Validation**: All operations require valid user authentication
3. **Admin Access**: Only enterprise users can view all links
4. **Unique Constraint**: A user cannot link the same rider twice

## Next Steps

### Optional Enhancements

1. **Add Email Verification**
   - Send email to rider's registered email when linked
   - Require confirmation before marking as verified

2. **Admin Verification UI**
   - Create admin page to review and verify user-rider links
   - Allow admins to reject incorrect links

3. **Search by Other Fields**
   - Allow searching by licence number
   - Allow searching by email

4. **Batch Linking**
   - Allow users to link multiple riders at once
   - Useful for coaches or team managers

5. **Link Notifications**
   - Notify users when their rider data is updated
   - Send sync notifications

## File Structure

```
media-platform/
├── supabase-schema.sql (lines 218-241)          # Full schema with user_riders
├── add-user-riders-table.sql                    # Standalone table creation
├── test-user-riders-schema.js                   # Test script
├── src/
│   ├── types/index.ts                          # TypeScript types
│   ├── app/
│   │   ├── api/
│   │   │   └── riders/
│   │   │       └── link/
│   │   │           └── route.ts                # API endpoints
│   │   └── profile/
│   │       └── link-rider/
│   │           └── page.tsx                    # User UI
```

## Troubleshooting

### Table doesn't exist
- Make sure you ran `add-user-riders-table.sql` in Supabase SQL Editor
- Run `node test-user-riders-schema.js` to verify

### Rider not found
- Check if riders are synced to database
- Verify FEI Registration number is correct (case-insensitive search)
- Run: `node test-riders-db.js` to check riders table

### Permission denied
- Ensure user is logged in
- Check RLS policies in Supabase
- Verify auth.uid() is working

### Cannot link (already linked)
- User may have already linked this rider
- Check the linked riders list on the page
- Try unlinking first if needed

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the server logs
3. Verify database schema is applied
4. Ensure Supabase credentials are correct in `.env.local`
