# Media Platform - Complete Documentation

**One file for all documentation. Everything you need is here.**

---

## TABLE OF CONTENTS

1. [Quick Start](#1-quick-start)
2. [Database Schema](#2-database-schema)
3. [Supabase Setup](#3-supabase-setup)
4. [Features Overview](#4-features-overview)
5. [Rider System Setup](#5-rider-system-setup)
6. [Shows Management System](#6-shows-management-system)
7. [API Documentation](#7-api-documentation)
8. [Component Documentation](#8-component-documentation)
9. [Deployment Guide](#9-deployment-guide)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. QUICK START

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Git

### Installation

```bash
# Clone the repository
cd media-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### First Steps

1. **Run Database Schema**: Copy `database-schema.sql` and run it in Supabase SQL Editor
2. **Create Admin User**: Sign up, then set `subscription_plan = 'enterprise'` in `user_profiles` table
3. **Access Admin Panel**: Go to `/admin/dashboard`

---

## 2. DATABASE SCHEMA

### Complete Schema File

The entire database schema is in `database-schema.sql`. Run this in Supabase SQL Editor.

### Tables Overview

**Streaming & Media:**
- `streams` - Live streaming sessions
- `archived_videos` - Past stream recordings
- `custom_titles` - Video categories

**User Management:**
- `user_profiles` - Extended user data
- `user_library` - User-specific media (deprecated, use rider_library)
- `user_library_sharing` - Content sharing
- `user_preferences` - User settings

**Rider System:**
- `riders` - Equestrian rider data from federation API
- `user_riders` - Links users to rider profiles
- `rider_library` - Media library per rider (multiple users can access)

**Shows System:**
- `shows` - Competition shows
- `classes` - Competition classes within shows
- `startlist` - Riders competing in each class
- `scores` - Competition results and scoring
- `team_scores` - Team competition results

### Key Concepts

**Rider-Based Library:**
- Library content belongs to RIDERS, not users
- Multiple users can link to same rider
- When admin uploads media for a user, it goes to their linked rider's library
- All users linked to that rider see the same content

**Admin Access:**
- Users with `subscription_plan = 'enterprise'` are admins
- Admins can manage all content, users, shows, and scoring

---

## 3. SUPABASE SETUP

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for database provisioning
4. Copy your project URL and keys

### Step 2: Run Database Schema

1. Open SQL Editor in Supabase
2. Copy entire contents of `database-schema.sql`
3. Paste and click "Run"
4. Verify success message appears

### Step 3: Configure Authentication

1. Go to Authentication → Settings
2. Enable Email authentication
3. Disable email confirmation for testing (optional)
4. Set site URL to `http://localhost:3003`

### Step 4: Set Up RLS Policies

RLS policies are automatically created by the schema. Verify in:
- Database → Policies
- Check that all tables have appropriate policies

### Step 5: Create Admin User

```sql
-- After signing up through the app, run this:
UPDATE user_profiles
SET subscription_plan = 'enterprise'
WHERE email = 'your-admin-email@example.com';
```

---

## 4. FEATURES OVERVIEW

### Live Streaming
- Create live streams
- Embed YouTube/Vimeo/custom players
- Track viewer counts
- Schedule future streams

### Archived Videos
- Upload past stream recordings
- Categorize with custom titles
- Thumbnail support
- Duration tracking

### User Management
- User profiles
- Subscription plans (free, premium, enterprise)
- Admin dashboard
- Search by name, email, licence, or FEI ID

### Rider System
- Import riders from federation API
- Link users to rider profiles
- FEI registration and licence tracking
- Club and nationality information

### Personal Library (Rider-Based)
- Upload photos, videos, documents
- Library belongs to riders
- Multiple users can access same rider's library
- Admin can upload for users
- Tags and metadata support

### Shows Management
- Create competition shows (national/international)
- Manage classes with 11 different rule types
- Excel upload for startlists
- Live scoring interface
- Multiple rounds and jump-offs support
- Team competition support

---

## 5. RIDER SYSTEM SETUP

### Overview

The rider system allows users to link their accounts to equestrian rider profiles from a federation API.

### Database Tables

**riders table:**
- Stores rider data from API
- FEI registration, licence numbers
- Club and nationality info
- Profile images

**user_riders table:**
- Links users to riders
- Supports verification status
- Multiple users can link to same rider

**rider_library table:**
- Stores media for riders
- Users access via their linked rider
- Admins can upload for riders

### Setting Up Rider API

1. Configure API endpoint in your code
2. Run rider sync to import data
3. Users can search and link to their profiles

### User Flow

1. User signs up
2. Goes to Profile → Link Rider
3. Searches by name, licence, or FEI ID
4. Links to their rider profile
5. Can now access rider's library

### Admin Flow

1. Admin uploads media for a user
2. System checks user's linked riders
3. Media is added to rider's library
4. All users linked to that rider see it

### API Endpoints

**GET /api/riders**
- Get all riders
- Query params: `search`, `club_id`, `country`

**POST /api/riders/sync**
- Sync riders from federation API
- Admin only

**POST /api/riders/link**
- Link user to rider
- Body: `{ rider_id, user_id }`

**DELETE /api/riders/link**
- Unlink user from rider
- Query: `link_id`, `user_id`

---

## 6. SHOWS MANAGEMENT SYSTEM

### Overview

Complete show jumping competition management with 11 class rule types, startlist management, and live scoring.

### Class Rules Supported

1. **One Round Against the Clock** - Fastest clear round wins
2. **One Round Not Against the Clock** - Fewest faults wins (time used for ties)
3. **Optimum Time** - Closest to target time wins
4. **Special Two Phases** - Two rounds, must complete both
5. **Two Phases** - Two rounds, fault in round 1 = eliminated
6. **One Round with Jump-off** - Clear round qualifies for jump-off
7. **Two Rounds with Tie-Breaker** - Two rounds, tie-breaker if needed
8. **Two Rounds Team with Tie-Breaker** - Team competition, top 3 scores count
9. **Accumulator** - Points instead of faults, max 65 points
10. **Speed and Handiness** - Time + faults converted to seconds
11. **6 Bars** - 6 obstacles, 5 rounds, increasing height

### Database Tables

**shows:**
- Show name, dates, location
- Show type (national/international)
- Status (upcoming, ongoing, completed, cancelled)

**classes:**
- Belongs to a show
- Class rule, height, pricing
- Time allowed, optimum time
- Can link to live stream
- Multiple rounds support

**startlist:**
- Riders competing in a class
- Start order, bib numbers
- Horse and rider info
- Team assignment (for team classes)

**scores:**
- Results for each rider in each round
- Time, faults, points
- Status (completed, retired, eliminated, withdrawn, cancelled)
- Jump-off support
- Rankings

**team_scores:**
- Team competition results
- Combined faults and time
- Rankings

### Setup Instructions

#### 1. Database Schema
Already included in `database-schema.sql` - no separate setup needed.

#### 2. Install Dependencies
```bash
npm install xlsx  # For Excel upload
```

#### 3. Create API Routes

Create these files:

**src/app/api/shows/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: shows, error } = await supabaseAdmin
      .from('shows')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(shows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(show);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create show' }, { status: 500 });
  }
}
```

**src/app/api/shows/[id]/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;
    return NextResponse.json(show);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch show' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(show);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update show' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabaseAdmin
      .from('shows')
      .delete()
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete show' }, { status: 500 });
  }
}
```

**src/app/api/classes/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const showId = searchParams.get('show_id');

    let query = supabaseAdmin.from('classes').select('*');
    if (showId) query = query.eq('show_id', showId);

    const { data: classes, error } = await query.order('class_date', { ascending: true });

    if (error) throw error;
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: classItem, error } = await supabaseAdmin
      .from('classes')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(classItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
```

**src/app/api/startlist/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('class_id');

    if (!classId) {
      return NextResponse.json({ error: 'class_id is required' }, { status: 400 });
    }

    const { data: startlist, error } = await supabaseAdmin
      .from('startlist')
      .select('*')
      .eq('class_id', classId)
      .order('start_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(startlist);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch startlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body;

    if (Array.isArray(entries)) {
      const { data: startlist, error } = await supabaseAdmin
        .from('startlist')
        .insert(entries)
        .select();

      if (error) throw error;
      return NextResponse.json(startlist);
    } else {
      const { data: entry, error } = await supabaseAdmin
        .from('startlist')
        .insert(body)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(entry);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create startlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('startlist')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
```

**src/app/api/scores/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('class_id');

    let query = supabaseAdmin.from('scores').select(`
      *,
      startlist (
        id, rider_name, horse_name, rider_id, start_order, team_name
      )
    `);

    if (classId) query = query.eq('class_id', classId);

    const { data: scores, error } = await query.order('rank', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: score, error } = await supabaseAdmin
      .from('scores')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(score);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create score' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data: score, error } = await supabaseAdmin
      .from('scores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(score);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
  }
}
```

#### 4. Add Shows Tab to Admin Dashboard

The Shows Management page is already created at `src/app/admin/shows/page.tsx`.

To add it to the admin dashboard, edit `src/app/admin/dashboard/page.tsx`:

Add Trophy import:
```typescript
import { Trophy } from 'lucide-react';
```

Add to tabs array:
```typescript
{ id: 'shows', label: 'Shows', icon: Trophy }
```

Add shows tab content:
```typescript
{activeTab === 'shows' && (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="text-center py-8">
        <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Show Management</h3>
        <p className="text-slate-600 mb-6">Manage show jumping competitions</p>
        <Link
          href="/admin/shows"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          <Trophy className="h-5 w-5" />
          Go to Shows Management
        </Link>
      </div>
    </div>
  </motion.div>
)}
```

### Excel Upload Format

For startlist uploads, Excel file should have these columns:

| Rider Name | Rider ID | Horse Name | Horse ID | Team Name | Bib Number |
|------------|----------|------------|----------|-----------|------------|
| John Smith | FEI12345 | Thunder    | H12345   | Team A    | 1          |

Required: Rider Name, Rider ID, Horse Name
Optional: Horse ID, Team Name, Bib Number

Download template from the Startlist page.

---

## 7. API DOCUMENTATION

### Authentication APIs

**POST /api/auth/signup**
- Register new user
- Body: `{ email, password, full_name }`
- Creates user_profile automatically

**POST /api/auth/login**
- Login user
- Body: `{ email, password }`
- Returns session token

### User APIs

**GET /api/users**
- Get all users (admin only)
- Returns users with linked rider data

**GET /api/users/:id**
- Get user by ID
- Returns user profile with rider links

### Rider APIs

**GET /api/riders**
- Get all riders
- Query: `search`, `club_id`, `country`

**POST /api/riders/sync**
- Sync from federation API (admin only)

**POST /api/riders/link**
- Link user to rider
- Body: `{ rider_id, user_id }`

**DELETE /api/riders/link**
- Unlink user from rider
- Query: `link_id`, `user_id`

### Library APIs

**GET /api/rider-library**
- Get library items
- Query: `riderId` or `userId`

**POST /api/rider-library**
- Add library item
- Body: `{ rider_id, title, content_type, file_url, ... }`

**DELETE /api/rider-library**
- Delete library item
- Query: `id`

### Shows APIs

**GET /api/shows**
- Get all shows

**POST /api/shows**
- Create show (admin only)
- Body: `{ name, start_date, end_date, show_type, ... }`

**PUT /api/shows/:id**
- Update show (admin only)

**DELETE /api/shows/:id**
- Delete show (admin only)

### Classes APIs

**GET /api/classes**
- Get classes
- Query: `show_id`

**POST /api/classes**
- Create class (admin only)
- Body: `{ show_id, class_name, class_rule, ... }`

### Startlist APIs

**GET /api/startlist**
- Get startlist
- Query: `class_id` (required)

**POST /api/startlist**
- Add entries
- Body: Single entry or `{ entries: [...] }` for bulk

**DELETE /api/startlist**
- Delete entry
- Query: `id`

### Scores APIs

**GET /api/scores**
- Get scores
- Query: `class_id`

**POST /api/scores**
- Create score (admin only)
- Body: `{ startlist_id, class_id, time_taken, jumping_faults, ... }`

**PUT /api/scores**
- Update score (admin only)
- Body: `{ id, ...updates }`

---

## 8. COMPONENT DOCUMENTATION

### Key Components

**AuthModal** - `src/components/AuthModal.tsx`
- Login/signup modal
- Email/password authentication
- Used throughout the app

**Navbar** - `src/components/Navbar.tsx`
- Main navigation
- Profile dropdown
- Responsive design

### Page Structure

**Public Pages:**
- `/` - Home page with live streams
- `/login` - Login page
- `/past-shows` - Archived videos
- `/my-library` - User library (requires login)

**User Pages:**
- `/profile` - User settings
- `/profile/link-rider` - Link to rider profile

**Admin Pages:**
- `/admin/dashboard` - Main admin panel
- `/admin/shows` - Shows management
- `/admin/shows/[showId]/class/[classId]/startlist` - Startlist management
- `/admin/shows/[showId]/class/[classId]/scoring` - Live scoring

### Styling

- **Framework**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme**: Slate color palette

---

## 9. DEPLOYMENT GUIDE

### Vercel Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy on Vercel**
- Go to https://vercel.com
- Import your GitHub repository
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Click Deploy

3. **Configure Supabase**
- Add your Vercel domain to Supabase → Authentication → URL Configuration
- Update redirect URLs

### Environment Variables

Production `.env` variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Post-Deployment

1. Create admin user in production
2. Run database migrations if needed
3. Test all features
4. Set up error monitoring (Sentry)
5. Configure CDN for media files

---

## 10. TROUBLESHOOTING

### Common Issues

**Issue: Login Infinite Loading**

**Cause:** User profile not created or database timeout

**Fix:**
1. Check browser console for errors
2. Run this SQL to check user_profiles:
```sql
SELECT * FROM user_profiles WHERE email = 'your-email';
```
3. If no profile exists, manually create:
```sql
INSERT INTO user_profiles (id, email, subscription_plan)
VALUES ('user-id-from-auth-users', 'email', 'free');
```

---

**Issue: "rider_id undefined" when uploading media**

**Cause:** User has no linked rider

**Fix:**
1. User must link to a rider first
2. Go to Profile → Link Rider
3. Search and link to rider profile
4. Then retry media upload

---

**Issue: Delete button not showing for admin**

**Cause:** User is not marked as admin

**Fix:**
```sql
UPDATE user_profiles
SET subscription_plan = 'enterprise'
WHERE email = 'admin@example.com';
```

---

**Issue: Excel upload fails**

**Cause:** Wrong column names or missing required fields

**Fix:**
1. Download template from Startlist page
2. Ensure columns: Rider Name, Rider ID, Horse Name
3. Check for extra spaces in column names
4. Save as .xlsx format

---

**Issue: Scores not saving**

**Cause:** Missing class_id or startlist_id

**Fix:**
1. Verify class exists
2. Verify startlist entry exists
3. Check admin permissions (subscription_plan = 'enterprise')

---

**Issue: RLS Policy Error**

**Cause:** Row Level Security blocking query

**Fix:**
1. Check if user is authenticated
2. Verify user_profiles entry exists
3. Check RLS policies in Supabase
4. Use service_role key for admin operations

---

**Issue: Shows not appearing**

**Cause:** Tables not created

**Fix:**
1. Run `database-schema.sql` in Supabase SQL Editor
2. Verify all tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

---

### Debug Mode

Enable detailed logging:

1. Open browser DevTools (F12)
2. Check Console tab
3. Look for errors in Network tab
4. Check Supabase logs in dashboard

### Getting Help

1. Check this documentation first
2. Search error messages in browser console
3. Check Supabase logs
4. Review database RLS policies
5. Verify all environment variables are set

---

## APPENDIX: File Structure

```
media-platform/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   └── shows/
│   │   ├── api/
│   │   │   ├── shows/
│   │   │   ├── classes/
│   │   │   ├── startlist/
│   │   │   ├── scores/
│   │   │   ├── users/
│   │   │   ├── riders/
│   │   │   └── rider-library/
│   │   ├── login/
│   │   ├── my-library/
│   │   ├── past-shows/
│   │   ├── profile/
│   │   └── page.tsx
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── database-schema.sql
├── package.json
└── COMPLETE_DOCUMENTATION.md (THIS FILE)
```

---

**Last Updated:** Now
**Version:** 1.0
**All documentation in ONE file.**
