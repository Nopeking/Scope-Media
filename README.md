# Scope Media Platform

A comprehensive media streaming and show jumping competition management platform built with Next.js 15, Supabase, and TypeScript.

## 🚀 Features

### Media Streaming
- ✨ Live streaming support with RTMP and YouTube integration
- 📹 Archived video library with custom categories
- 🎨 Beautiful, responsive UI with Framer Motion animations
- 📱 Mobile-friendly design
- 🔍 Advanced filtering by month and category
- 🎥 Custom video player with React Player
- 👨‍💼 Admin dashboard for content management

### Show Jumping Competition Management
- 🏆 Show and class management
- 📋 Startlist management with Excel upload support
- ⏱️ Live scoring system with multiple class rules
- 🎯 Results display for live stream embedding
- 👥 Rider and horse database with FEI ID and License support
- 📊 Leaderboards and rankings
- 🔗 Stream linking to competitions

### User Management
- 🔐 Authentication with Supabase
- 👤 User profiles and preferences
- 📚 Personal media library
- 🎭 Admin role system
- 🔗 Rider linking for athletes

## 📦 Tech Stack

- **Framework:** Next.js 15 with App Router and Turbopack
- **UI:** React 19, Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Animations:** Framer Motion
- **Video Player:** React Player
- **Icons:** Lucide React
- **Language:** TypeScript
- **Excel Processing:** xlsx

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Nopeking/Scope-Media.git
cd media-platform
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Set up Supabase database:**

- Go to your Supabase Dashboard → SQL Editor
- Copy the entire contents of `database-schema.sql`
- Paste and run it in the SQL Editor

5. **Create demo users:**
```bash
npm run setup:demo
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- Demo user: `demo@scopemedia.com` / `demo123`

6. **Start the development server:**
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
media-platform/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── page.tsx             # Homepage
│   │   ├── live/                # Live streams page
│   │   ├── past-shows/          # Archived videos page
│   │   ├── login/               # Login page
│   │   ├── admin/               # Admin dashboard
│   │   │   ├── shows/           # Show management
│   │   │   ├── riders/          # Rider management
│   │   │   └── dashboard/       # Admin dashboard
│   │   ├── results/             # Public results display
│   │   └── api/                 # API routes
│   ├── components/              # Reusable React components
│   │   ├── AuthGuard.tsx       # Authentication guard
│   │   └── ...                  # Other components
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── lib/                     # Library code
│   │   └── supabase.ts         # Supabase client
│   ├── types/                   # TypeScript type definitions
│   └── middleware.ts            # Next.js middleware
├── scripts/                     # Utility scripts
│   ├── seed-data.js            # Database seeding
│   ├── setup-demo-users.js     # Create demo users
│   └── fix-admin-simple.js     # Admin setup
├── database-schema.sql          # Complete database schema
├── public/                      # Static assets
└── [config files]
```

## 🎯 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup:demo` - Create demo users

## 📖 Usage Guide

### Admin Dashboard

Access the admin panel at `/admin` (requires login with admin account).

#### Show Management

1. **Create a Show:**
   - Navigate to Admin → Shows
   - Click "Create Show"
   - Fill in show details (name, dates, type, location)
   - Save the show

2. **Create Classes:**
   - Click on a show to view details
   - Click "Add Class"
   - Select class rule (One Round Against Clock, Jump-off, etc.)
   - Set class parameters (height, time allowed, prize money)
   - Link to a live stream (optional)

3. **Upload Startlist:**
   - Click on a class
   - Go to Startlist tab
   - Download Excel template
   - Fill in rider and horse details
   - Upload the completed Excel file

**Excel Template Format:**
```csv
S.No,Rider Name,FEI ID,Rider ID,Horse Name,Horse ID,Team Name,Club Name
1,John Smith,10204650,LIC123,Thunder,H12345,Team A,Dubai Equestrian Club
2,Jane Doe,10305751,LIC456,Lightning,H67890,Team A,Abu Dhabi Riding Club
```

**Column Explanations:**
- `S.No` - Start order (1, 2, 3...)
- `Rider Name` - Full name of the rider
- `FEI ID` - FEI registration number (e.g., "10204650")
- `Rider ID` - License number (e.g., "LIC123")
- `Horse Name` - Horse's name
- `Horse ID` - Horse registration number
- `Team Name` - Team name (optional, for team events)
- `Club Name` - Riding club name (optional)

#### Live Scoring

1. **Access Scoring Page:**
   - Navigate to Class → Scoring tab
   - Copy the scoring link or results display link

2. **Enter Scores:**
   - Click on a rider to score
   - Enter time taken
   - Enter jumping faults (knockdowns, refusals)
   - System auto-calculates time faults and total faults
   - Save score

3. **Results Display:**
   - Copy "Results Link (Stream)"
   - Embed in OBS/vMix as browser source
   - Shows current leaderboard and next rider
   - Auto-refreshes every 3 seconds

#### Rider Management

1. **Add Riders:**
   - Navigate to Admin → Riders
   - Click "Add Rider"
   - Enter rider details including FEI ID and License
   - Save rider profile

2. **Link User to Rider:**
   - Users can link their account to their rider profile
   - Allows access to personal media library

### Public Pages

- **Homepage** (`/`) - Featured live streams and recent videos
- **Live Streams** (`/live`) - View all active live streams
- **Past Shows** (`/past-shows`) - Browse archived videos
- **Results** (`/results/[classId]`) - Public results display for embedding

## 🗄️ Database Schema

The platform uses PostgreSQL via Supabase with the following main tables:

### Core Media Tables
- `streams` - Live stream data
- `archived_videos` - Archived video library
- `custom_titles` - Video categories

### User Tables
- `user_profiles` - User profile data (extends Supabase auth)
- `user_library` - Personal media library
- `user_preferences` - User settings

### Show Jumping Tables
- `shows` - Show/competition information
- `classes` - Competition classes
- `startlist` - Rider and horse entries
- `scores` - Individual round scores
- `team_scores` - Team competition scores

### Rider Tables
- `riders` - Rider database with FEI and license data
- `user_riders` - Links users to rider profiles
- `rider_library` - Media associated with riders

All tables include:
- Row Level Security (RLS) policies
- Proper indexes for performance
- Foreign key constraints
- Timestamps (created_at, updated_at)

## 🔐 Authentication & Security

### Current Implementation
- ✅ Supabase Authentication
- ✅ User profiles with role system
- ✅ Admin-only access control (client-side)
- ✅ Row Level Security on database
- ⚠️ Server-side middleware temporarily disabled (using client-side guards)

### Security Notes
- Admin access is protected by `AuthGuard` component
- All database queries respect RLS policies
- Passwords are hashed by Supabase
- Service role key should never be exposed to client

### TODO: Implement Proper SSR Auth
- Install `@supabase/ssr` package
- Update middleware to use cookie-based authentication
- Enable server-side admin role checking

## 🏆 Class Rules Supported

1. **One Round Against Clock** - Single round, fastest clear wins
2. **One Round Not Against Clock** - Single round, lowest faults win
3. **Optimum Time** - Closest to target time wins
4. **Special Two Phases** - Two phases in one round
5. **Two Phases** - Two separate phases
6. **One Round with Jump-off** - Clear rounds qualify for jump-off
7. **Two Rounds with Tiebreaker** - Two rounds plus tiebreaker if needed
8. **Two Rounds Team with Tiebreaker** - Team competition format
9. **Accumulator** - Points for each fence cleared
10. **Speed and Handiness** - Technical course against the clock
11. **Six Bars** - Progressive height competition

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

**Note:** Ensure Supabase is properly configured before deploying.

### Environment Variables Required:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 API Routes

- `POST /api/streams` - Create/manage streams
- `POST /api/videos` - Create/manage videos
- `POST /api/shows` - Create/manage shows
- `POST /api/classes` - Create/manage classes
- `POST /api/startlist` - Upload/manage startlists
- `POST /api/scores` - Submit/update scores

## 🔧 Troubleshooting

### Login Redirect Issues
If login doesn't redirect to admin panel:
- Clear browser cache and cookies
- Check browser console for errors
- Verify Supabase environment variables are correct
- Ensure user has `is_admin` set to `true` in database

### Profile Fetch Timeout
If you get "Profile fetch timeout" error:
- Run the RLS policy fixes in Supabase SQL Editor (see `database-schema.sql`)
- Check Supabase Dashboard → Authentication → Policies

### Excel Upload Fails
- Ensure Excel file matches template format exactly
- Check column names are correct (case-sensitive)
- Verify S.No column has numbers starting from 1

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and not licensed for public use.

## 👨‍💻 Author

Built for Scope Media

## 🔗 Links

- Repository: [https://github.com/Nopeking/Scope-Media](https://github.com/Nopeking/Scope-Media)

---

**Need Help?** Check the code comments or open an issue on GitHub.
