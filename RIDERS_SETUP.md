# Riders Database Setup & Documentation

This document explains the rider database system that automatically syncs data from the UAE ERF API.

## Overview

The rider management system provides:
- ✅ Automatic data synchronization from UAE ERF API
- ✅ PostgreSQL database storage via Supabase
- ✅ RESTful API endpoints for CRUD operations
- ✅ Admin UI for managing riders
- ✅ Scheduled automatic updates every 6 hours
- ✅ Full TypeScript support

---

## 1. Database Schema

### Riders Table

The `riders` table stores all motorsport rider information:

```sql
CREATE TABLE riders (
  id UUID PRIMARY KEY,
  external_id TEXT UNIQUE,           -- ID from UAE ERF API
  rider_number TEXT,                 -- Rider's racing number
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT,
  nationality TEXT,
  team TEXT,
  bike_make TEXT,                    -- e.g., "Yamaha", "Honda"
  bike_model TEXT,                   -- e.g., "YZF-R1", "CBR1000RR"
  season TEXT,
  category TEXT,
  championship TEXT,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,                    -- Full API response
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Indexes

- `idx_riders_external_id` - Fast lookups by external API ID
- `idx_riders_rider_number` - Search by rider number
- `idx_riders_team` - Filter by team
- `idx_riders_nationality` - Filter by nationality
- `idx_riders_is_active` - Filter active/inactive riders
- `idx_riders_last_synced_at` - Track sync status

---

## 2. Setup Instructions

### Step 1: Run Database Migration

Execute the SQL schema to create the riders table:

```bash
# Apply schema to your Supabase database
psql $DATABASE_URL < supabase-schema.sql

# OR use Supabase SQL Editor:
# 1. Go to https://app.supabase.com
# 2. Select your project
# 3. Go to SQL Editor
# 4. Copy and paste the riders table creation SQL
# 5. Click "Run"
```

### Step 2: Configure Environment Variables

Add the following to your `.env.local` file (optional for cron job security):

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Cron job security
CRON_SECRET=your_random_secret_key_here
```

Generate a secure `CRON_SECRET`:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32|ForEach-Object{Get-Random -Max 256}))
```

### Step 3: Install Dependencies

The required packages are already installed:
- ✅ `xml2js` - For parsing XML responses from UAE ERF API
- ✅ `@types/xml2js` - TypeScript definitions

### Step 4: Deploy

If deploying to Vercel:

```bash
# The vercel.json file is already configured
# Just deploy normally
vercel deploy --prod
```

For other platforms, see **Alternative Cron Setup** below.

---

## 3. API Endpoints

### 3.1 GET /api/riders

Fetch all riders with optional filters.

**Query Parameters:**
- `active` - Filter by status: `true` or `false`
- `team` - Filter by team name
- `nationality` - Filter by nationality

**Example:**
```bash
# Get all riders
curl http://localhost:3000/api/riders

# Get only active riders
curl http://localhost:3000/api/riders?active=true

# Get riders from specific team
curl http://localhost:3000/api/riders?team=Yamaha%20Racing
```

**Response:**
```json
[
  {
    "id": "uuid",
    "external_id": "123",
    "rider_number": "25",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "nationality": "UAE",
    "team": "Racing Team",
    "bike_make": "Yamaha",
    "bike_model": "YZF-R1",
    "is_active": true,
    "last_synced_at": "2025-01-11T10:00:00Z",
    ...
  }
]
```

### 3.2 POST /api/riders

Create or update a rider manually.

**Request Body:**
```json
{
  "external_id": "123",
  "rider_number": "25",
  "first_name": "John",
  "last_name": "Doe",
  "nationality": "UAE",
  "team": "Racing Team",
  "bike_make": "Yamaha",
  "bike_model": "YZF-R1",
  "is_active": true
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/riders \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","rider_number":"25"}'
```

### 3.3 DELETE /api/riders?id={uuid}

Delete a rider by ID.

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/riders?id=uuid-here"
```

### 3.4 POST /api/riders/sync

Manually trigger synchronization from UAE ERF API.

**Example:**
```bash
curl -X POST http://localhost:3000/api/riders/sync
```

**Response:**
```json
{
  "success": true,
  "synced": 45,
  "errors": 0,
  "errorDetails": [],
  "timestamp": "2025-01-11T10:00:00Z"
}
```

### 3.5 GET /api/riders/sync

Get sync status information.

**Response:**
```json
{
  "totalRiders": 45,
  "lastSyncedAt": "2025-01-11T10:00:00Z"
}
```

---

## 4. Automatic Sync

### Vercel Cron Jobs (Recommended for Vercel)

The `vercel.json` file is configured to run sync every 6 hours:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-riders",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Schedule format (cron syntax):
- `0 */6 * * *` = Every 6 hours
- `0 */12 * * *` = Every 12 hours
- `0 0 * * *` = Daily at midnight
- `0 0 * * 0` = Weekly on Sunday at midnight

**No additional setup required for Vercel!**

### Alternative Cron Setup (Self-Hosted or Other Platforms)

#### Option 1: External Cron Service

Use [cron-job.org](https://cron-job.org) or similar:

1. Create free account at cron-job.org
2. Add new cron job with URL:
   ```
   https://your-domain.com/api/cron/sync-riders
   ```
3. Set schedule (e.g., "Every 6 hours")
4. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

#### Option 2: Server Cron (Linux)

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add this line (runs every 6 hours)
0 */6 * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/sync-riders
```

#### Option 3: Node.js Scheduled Task

Install `node-cron`:
```bash
npm install node-cron
```

Create `scripts/cron-scheduler.js`:
```javascript
const cron = require('node-cron');

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running rider sync...');
  try {
    const response = await fetch('http://localhost:3000/api/cron/sync-riders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });
    const result = await response.json();
    console.log('Sync result:', result);
  } catch (error) {
    console.error('Sync failed:', error);
  }
});

console.log('Cron scheduler started');
```

Run alongside your app:
```bash
node scripts/cron-scheduler.js
```

---

## 5. Admin UI Usage

### Accessing the Admin Panel

Navigate to: `/admin/riders`

### Features

1. **Dashboard Stats**
   - Total riders count
   - Active riders count
   - Last sync timestamp

2. **Search & Filter**
   - Search by name, number, team, or nationality
   - Filter: All / Active / Inactive

3. **Manual Sync**
   - Click "Sync from UAE ERF" button
   - See sync results with success/error counts

4. **Rider Management**
   - View rider details in table
   - Delete riders individually
   - See rider photos (if available)

### Adding Admin Link to Navigation

Update your admin navigation to include riders:

```tsx
// In your admin layout or navigation component
<Link href="/admin/riders">
  Riders Management
</Link>
```

---

## 6. Customizing the Sync

### Adjusting Field Mapping

The `mapRiderData()` function in [`src/app/api/riders/sync/route.ts:157`](src/app/api/riders/sync/route.ts#L157) maps API fields to database fields.

To customize:

```typescript
function mapRiderData(apiData: any): any {
  return {
    external_id: apiData.YourApiIdField,
    rider_number: apiData.YourNumberField,
    first_name: apiData.YourFirstNameField,
    last_name: apiData.YourLastNameField,
    // ... map other fields
  };
}
```

### Handling Different API Response Formats

The sync route handles both XML and JSON responses. If the API structure differs, update [`extractRidersFromXml()`](src/app/api/riders/sync/route.ts#L135):

```typescript
function extractRidersFromXml(xmlData: any): any[] {
  // Update path based on your API's XML structure
  if (xmlData?.YourRootNode?.rider) {
    return xmlData.YourRootNode.rider;
  }
  return [];
}
```

---

## 7. Testing

### Test Database Schema

```bash
cd media-platform
npm run test:db
```

### Test API Endpoints

```bash
# Test GET riders
curl http://localhost:3000/api/riders

# Test manual sync
curl -X POST http://localhost:3000/api/riders/sync

# Test cron endpoint (with secret)
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/sync-riders
```

### Test in Browser

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/riders`
3. Click "Sync from UAE ERF"
4. Check browser console for detailed logs

---

## 8. Troubleshooting

### Issue: "Supabase not configured"

**Solution:** Ensure environment variables are set:
```bash
# Check .env.local file
cat .env.local | grep SUPABASE
```

### Issue: "Failed to fetch from UAE ERF API"

**Possible causes:**
1. API endpoint is down
2. Network/firewall blocking request
3. API requires authentication

**Debug:**
```bash
# Test API directly
curl -H "Host: ws.uaeerf.ae" \
  http://ws.uaeerf.ae/webservices/wseguide.asmx/getRiderList
```

### Issue: Riders not syncing

**Check:**
1. Cron job is running (check Vercel logs or cron service logs)
2. `CRON_SECRET` matches between `.env.local` and cron configuration
3. Database has write permissions

**View logs:**
```bash
# Vercel
vercel logs

# Or check Supabase logs in dashboard
```

### Issue: XML parsing errors

**Solution:** The API response structure may differ. Check the console output in the sync response to see the actual XML structure, then update `extractRidersFromXml()`.

---

## 9. API Response Structure (UAE ERF)

The UAE ERF API endpoint is:
```
GET http://ws.uaeerf.ae/webservices/wseguide.asmx/getRiderList
Host: ws.uaeerf.ae
```

Expected response format: **XML** (HTTP/1.1 200 OK)

If the actual structure differs from expectations, check the console logs during sync for the XML structure and update the mapping functions accordingly.

---

## 10. Security Considerations

1. **API Rate Limiting**: The sync runs every 6 hours to avoid rate limiting
2. **Cron Security**: Use `CRON_SECRET` to prevent unauthorized sync triggers
3. **Database Security**: Supabase RLS policies allow public read but require auth for writes
4. **Admin Access**: Implement proper authentication for `/admin/riders` route

### Recommended: Add Authentication

Protect the admin route in [`src/app/admin/riders/page.tsx:1`](src/app/admin/riders/page.tsx#L1):

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Your auth context

export default function RidersAdmin() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // ... rest of component
}
```

---

## 11. TypeScript Types

All rider types are defined in [`src/types/index.ts:332`](src/types/index.ts#L332):

```typescript
import type { Rider, RiderInsert, RiderUpdate } from '@/types';

// Use in components
const rider: Rider = { ... };

// Use for creating new riders
const newRider: RiderInsert = { ... };

// Use for partial updates
const updates: RiderUpdate = { ... };
```

---

## 12. Next Steps

### Recommended Enhancements

1. **Public Riders Page**: Create a public-facing riders directory at `/riders`
2. **Rider Details Page**: Individual rider profile pages with stats
3. **Real-time Updates**: Use Supabase real-time subscriptions
4. **Admin Dashboard Widget**: Add riders stats to main admin dashboard
5. **Bulk Operations**: Import/export riders via CSV
6. **Search Optimization**: Add full-text search with PostgreSQL

### Example: Public Riders Page

Create [`src/app/riders/page.tsx`](src/app/riders/page.tsx):
```tsx
'use client';

import { useState, useEffect } from 'react';
import type { Rider } from '@/types';

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);

  useEffect(() => {
    fetch('/api/riders?active=true')
      .then(res => res.json())
      .then(data => setRiders(data));
  }, []);

  return (
    <div>
      <h1>Riders Directory</h1>
      {/* Display riders */}
    </div>
  );
}
```

---

## 13. Support

For issues or questions:

1. Check this documentation
2. Review [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
3. Check API logs in Vercel/Supabase dashboard
4. Verify database schema matches [`supabase-schema.sql:170`](supabase-schema.sql#L170)

---

## Summary

✅ **Database**: PostgreSQL table with comprehensive rider fields
✅ **API**: Full CRUD operations + sync endpoint
✅ **Sync**: Automatic updates every 6 hours from UAE ERF API
✅ **Admin UI**: Complete management interface
✅ **TypeScript**: Full type safety
✅ **Flexible**: Works with Vercel, self-hosted, or any platform

Your rider database is now ready to automatically sync and manage motorsport rider data!
