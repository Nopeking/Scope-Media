# Scope Media Platform - Comprehensive Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [API Documentation](#api-documentation)
5. [Component Documentation](#component-documentation)
6. [Database Schema](#database-schema)
7. [Scripts & Commands](#scripts--commands)
8. [Deployment Guide](#deployment-guide)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Scope Media Platform** is a modern media streaming platform built with Next.js 15, featuring live streams and archived video content. The platform provides both user-facing content consumption and admin management capabilities.

### Key Features
- ✨ **Live Streaming** - RTMP and YouTube integration
- 📹 **Video Library** - Archived video content with custom categories
- 🎨 **Modern UI** - Responsive design with Framer Motion animations
- 👨‍💼 **Admin Dashboard** - Content management system
- 💾 **Database Integration** - Supabase backend with real-time capabilities
- 🔐 **Authentication** - User management and profiles
- 📱 **Mobile Support** - Cross-platform compatibility

### Tech Stack
- **Framework**: Next.js 15 with Turbopack
- **UI**: React 18, Tailwind CSS 3.4
- **Animations**: Framer Motion 12
- **Video Player**: React Player 3.3
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Pages         │    │ • /api/streams  │    │ • streams       │
│ • Components    │    │ • /api/videos   │    │ • archived_videos│
│ • Contexts      │    │ • /api/titles   │    │ • custom_titles │
│ • Hooks         │    │ • /api/users    │    │ • user_profiles │
└─────────────────┘    └─────────────────┘    │ • user_library  │
                                              └─────────────────┘
```

### Data Flow
1. **User Interaction** → React Components
2. **API Calls** → Next.js API Routes
3. **Database Operations** → Supabase Client
4. **Real-time Updates** → Supabase Subscriptions
5. **State Management** → React Context + Hooks

---

## 📁 File Structure

```
media-platform/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📄 page.tsx           # Homepage
│   │   ├── 📄 layout.tsx         # Root layout
│   │   ├── 📄 globals.css        # Global styles
│   │   ├── 📁 live/              # Live streams page
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 past-shows/        # Archived videos page
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 my-library/        # User library page
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 login/             # Authentication page
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 admin/             # Admin dashboard
│   │   │   ├── 📄 page.tsx
│   │   │   └── 📁 dashboard/
│   │   │       └── 📄 page.tsx
│   │   └── 📁 api/               # API routes
│   │       ├── 📁 streams/       # Streams API
│   │       │   └── 📄 route.ts
│   │       ├── 📁 videos/        # Videos API
│   │       │   └── 📄 route.ts
│   │       ├── 📁 titles/        # Categories API
│   │       │   └── 📄 route.ts
│   │       ├── 📁 users/         # Users API
│   │       │   └── 📄 route.ts
│   │       └── 📁 user-library/  # User library API
│   │           └── 📄 route.ts
│   ├── 📁 components/            # Reusable components
│   │   ├── 📄 Navigation.tsx     # Main navigation
│   │   ├── 📄 LiveFeatureBox.tsx # Live content display
│   │   ├── 📄 VideoPlayer.tsx    # Video player component
│   │   ├── 📄 AuthModal.tsx      # Authentication modal
│   │   ├── 📄 ThemeToggle.tsx    # Dark/light mode toggle
│   │   └── 📄 NoSSR.tsx          # Client-side only wrapper
│   ├── 📁 contexts/              # React contexts
│   │   └── 📄 AuthContext.tsx    # Authentication context
│   ├── 📁 hooks/                 # Custom hooks
│   │   └── 📄 useHydrationFix.ts # Hydration fix hook
│   ├── 📁 lib/                   # Utility libraries
│   │   └── 📄 supabase.ts        # Supabase client
│   └── 📁 types/                 # TypeScript definitions
│       └── 📄 index.ts           # Type definitions
├── 📁 data/                      # JSON database (legacy)
│   ├── 📄 streams.json
│   ├── 📄 videos.json
│   └── 📄 titles.json
├── 📁 scripts/                   # Utility scripts
│   ├── 📄 seed-data.js           # Database seeding
│   ├── 📄 migrate-to-supabase.js # Migration script
│   └── 📄 test-*.js              # Test scripts
├── 📁 public/                    # Static assets
│   ├── 📄 logo.png
│   └── 📄 favicon.ico
├── 📄 package.json               # Dependencies & scripts
├── 📄 next.config.js             # Next.js configuration
├── 📄 tailwind.config.ts         # Tailwind CSS config
├── 📄 tsconfig.json              # TypeScript config
└── 📄 README.md                  # Project documentation
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All API routes require proper Supabase authentication. Admin routes use service role key.

### Endpoints

#### 1. Streams API (`/api/streams`)

**GET** - Fetch all streams
```typescript
// Request
GET /api/streams

// Response
[
  {
    "id": "uuid",
    "title": "Live Stream Title",
    "url": "rtmp://example.com/live",
    "status": "active" | "inactive" | "scheduled",
    "thumbnail": "https://example.com/thumb.jpg",
    "viewers": 150,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**POST** - Add new stream
```typescript
// Request
POST /api/streams
Content-Type: application/json

{
  "title": "New Stream",
  "url": "rtmp://example.com/live",
  "status": "active",
  "thumbnail": "https://example.com/thumb.jpg",
  "viewers": 0
}

// Response
{
  "id": "uuid",
  "title": "New Stream",
  // ... other fields
}
```

**DELETE** - Delete stream
```typescript
// Request
DELETE /api/streams?id=uuid

// Response
{
  "success": true
}
```

#### 2. Videos API (`/api/videos`)

**GET** - Fetch all videos
```typescript
// Request
GET /api/videos

// Response
[
  {
    "id": "uuid",
    "title": "Video Title",
    "url": "https://youtube.com/watch?v=...",
    "duration": "1:30:00",
    "upload_date": "2024-01-01T00:00:00Z",
    "custom_title": "Category Name",
    "thumbnail": "https://example.com/thumb.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**POST** - Add new video
```typescript
// Request
POST /api/videos
Content-Type: application/json

{
  "title": "New Video",
  "url": "https://youtube.com/watch?v=...",
  "duration": "1:30:00",
  "custom_title": "Category Name",
  "thumbnail": "https://example.com/thumb.jpg"
}
```

**DELETE** - Delete video
```typescript
// Request
DELETE /api/videos?id=uuid

// Response
{
  "success": true
}
```

#### 3. Titles API (`/api/titles`)

**GET** - Fetch all categories
```typescript
// Request
GET /api/titles

// Response
[
  {
    "id": "uuid",
    "title": "Category Name",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**POST** - Add new category
```typescript
// Request
POST /api/titles
Content-Type: application/json

{
  "title": "New Category"
}
```

**DELETE** - Delete category
```typescript
// Request
DELETE /api/titles?title=Category%20Name

// Response
{
  "success": true
}
```

#### 4. Users API (`/api/users`)

**GET** - Fetch all users
```typescript
// Request
GET /api/users

// Response
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name",
    "avatar_url": "https://example.com/avatar.jpg",
    "subscription_plan": "free" | "premium" | "enterprise",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**POST** - Update user
```typescript
// Request
POST /api/users
Content-Type: application/json

{
  "userId": "uuid",
  "email": "newemail@example.com",
  "full_name": "New Name",
  "subscription_plan": "premium"
}
```

#### 5. User Library API (`/api/user-library`)

**GET** - Fetch user library
```typescript
// Request
GET /api/user-library?userId=uuid

// Response
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Library Item",
    "description": "Item description",
    "content_type": "video" | "photo" | "document",
    "file_url": "https://example.com/file.mp4",
    "thumbnail_url": "https://example.com/thumb.jpg",
    "file_size": 1024000,
    "duration": "1:30:00",
    "tags": ["tag1", "tag2"],
    "is_public": false,
    "uploaded_by_admin": false,
    "admin_uploader_id": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**POST** - Add library item
```typescript
// Request
POST /api/user-library
Content-Type: application/json

{
  "user_id": "uuid",
  "title": "New Item",
  "description": "Item description",
  "content_type": "video",
  "file_url": "https://example.com/file.mp4",
  "thumbnail_url": "https://example.com/thumb.jpg",
  "file_size": 1024000,
  "duration": "1:30:00",
  "tags": ["tag1", "tag2"],
  "is_public": false
}
```

**DELETE** - Delete library item
```typescript
// Request
DELETE /api/user-library?id=uuid

// Response
{
  "success": true
}
```

---

## 🧩 Component Documentation

### 1. Navigation Component (`Navigation.tsx`)

**Purpose**: Main navigation bar with theme toggle and user authentication.

**Props**: None (uses AuthContext)

**Key Features**:
- Responsive design
- Theme toggle (dark/light mode)
- User authentication state
- Search functionality
- Admin access link

**Usage**:
```tsx
import Navigation from '@/components/Navigation';

// In layout.tsx
<Navigation />
```

### 2. LiveFeatureBox Component (`LiveFeatureBox.tsx`)

**Purpose**: Displays live streams and recent videos in a grid layout.

**Props**:
```typescript
interface LiveFeatureBoxProps {
  liveStreams: LiveStreamProps[];
  recentVideos: RecentVideoProps[];
  onVideoClick?: (video: any) => void;
}
```

**Key Features**:
- Animated grid layout
- Hover effects
- Click handlers for video selection
- Responsive design
- Live status indicators

**Usage**:
```tsx
<LiveFeatureBox 
  liveStreams={streams}
  recentVideos={videos}
  onVideoClick={handleVideoClick}
/>
```

### 3. VideoPlayer Component (`VideoPlayer.tsx`)

**Purpose**: Custom video player with React Player integration.

**Props**:
```typescript
interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  autoplay?: boolean;
  controls?: boolean;
  width?: string;
  height?: string;
}
```

**Key Features**:
- YouTube and RTMP support
- Custom controls
- Thumbnail display
- Responsive sizing
- Error handling

**Usage**:
```tsx
<VideoPlayer
  url="https://youtube.com/watch?v=..."
  thumbnail="https://example.com/thumb.jpg"
  autoplay={true}
/>
```

### 4. AuthModal Component (`AuthModal.tsx`)

**Purpose**: Authentication modal for login/signup.

**Props**:
```typescript
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}
```

**Key Features**:
- Login and signup forms
- Form validation
- Supabase authentication
- Error handling
- Responsive design

**Usage**:
```tsx
<AuthModal
  isOpen={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  mode="login"
/>
```

### 5. ThemeToggle Component (`ThemeToggle.tsx`)

**Purpose**: Dark/light mode toggle button.

**Props**: None

**Key Features**:
- Theme persistence
- Smooth transitions
- Icon updates
- System preference detection

**Usage**:
```tsx
<ThemeToggle />
```

### 6. NoSSR Component (`NoSSR.tsx`)

**Purpose**: Client-side only rendering wrapper to prevent hydration issues.

**Props**:
```typescript
interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Key Features**:
- Prevents hydration mismatches
- Fallback content support
- Client-side only rendering

**Usage**:
```tsx
<NoSSR fallback={<LoadingSpinner />}>
  <ClientOnlyComponent />
</NoSSR>
```

---

## 🗄️ Database Schema

### Supabase Tables

#### 1. Streams Table
```sql
CREATE TABLE streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'scheduled')),
  thumbnail TEXT,
  viewers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Archived Videos Table
```sql
CREATE TABLE archived_videos (
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
```

#### 3. Custom Titles Table
```sql
CREATE TABLE custom_titles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. User Library Table
```sql
CREATE TABLE user_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'photo', 'document')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  duration TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  uploaded_by_admin BOOLEAN DEFAULT false,
  admin_uploader_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. User Library Sharing Table
```sql
CREATE TABLE user_library_sharing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  library_item_id UUID REFERENCES user_library(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'download', 'edit')),
  shared_by_user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(library_item_id, shared_with_user_id)
);
```

### Row Level Security (RLS) Policies

All tables have RLS enabled with appropriate policies for:
- Public read access for content
- User-specific access for personal data
- Admin access for management operations

---

## 🛠️ Scripts & Commands

### Package.json Scripts

#### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

#### Database Management
```bash
# Seed database with default content
npm run seed

# Migrate to Supabase
npm run migrate

# Create new migration
npm run migration:create

# Run migrations
npm run migration:run
```

#### Testing & Debugging
```bash
# Test database connection
npm run test:db

# Test user profile functionality
npm run test:profile

# Test login functionality
npm run test:login

# Test user library
npm run test:library

# Test users API
npm run test:users-api

# Check current users
npm run check:users

# Setup demo users
npm run setup:demo
```

### Custom Scripts

#### 1. Database Seeding (`scripts/seed-data.js`)
```bash
node scripts/seed-data.js
```
**Purpose**: Creates initial data for development
**Creates**:
- Default equestrian video
- Empty streams collection
- Default categories

#### 2. Supabase Migration (`scripts/migrate-to-supabase.js`)
```bash
node scripts/migrate-to-supabase.js
```
**Purpose**: Migrates JSON data to Supabase
**Process**:
- Reads JSON files
- Connects to Supabase
- Inserts data into tables
- Handles errors gracefully

#### 3. Test Scripts
All test scripts follow the pattern:
```bash
node scripts/test-[feature].js
```
**Features tested**:
- Database connection
- User profiles
- Login functionality
- User library
- Users API

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- Supabase account
- Environment variables configured

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Local Development
```bash
# Clone repository
git clone https://github.com/Nopeking/Scope-Media.git
cd media-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Seed database
npm run seed

# Start development server
npm run dev
```

### Production Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### VPS/Dedicated Server
```bash
# Build application
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "media-platform" -- start
```

### Database Setup
1. Create Supabase project
2. Run schema SQL in Supabase SQL editor
3. Configure RLS policies
4. Set up environment variables
5. Run migration script

---

## 🔄 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally
npm run dev

# Run tests
npm run test:db
npm run test:profile

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Database Changes
```bash
# Create migration
npm run migration:create

# Edit migration file in scripts/migrations/

# Run migration
npm run migration:run

# Test changes
npm run test:db
```

### 3. Component Development
1. Create component in `src/components/`
2. Add TypeScript types
3. Add to storybook (if applicable)
4. Test with different props
5. Update documentation

### 4. API Development
1. Create route in `src/app/api/`
2. Add proper error handling
3. Add TypeScript types
4. Test with Postman/curl
5. Update API documentation

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Hydration Mismatch
**Error**: `Text content does not match server-rendered HTML`
**Solution**: Use `NoSSR` component for client-only content
```tsx
<NoSSR fallback={<LoadingSpinner />}>
  <ClientOnlyComponent />
</NoSSR>
```

#### 2. Supabase Connection Issues
**Error**: `Failed to fetch streams`
**Solution**: Check environment variables and Supabase project status
```bash
npm run test:db
```

#### 3. Build Errors
**Error**: TypeScript compilation errors
**Solution**: Check types and run linting
```bash
npm run lint
```

#### 4. Database Migration Issues
**Error**: Migration fails
**Solution**: Check Supabase permissions and schema
```bash
npm run test:db
```

### Debug Commands
```bash
# Check database connection
npm run test:db

# Test user functionality
npm run test:profile

# Check current users
npm run check:users

# Test API endpoints
npm run test:users-api
```

### Logs and Monitoring
- Check browser console for client-side errors
- Check terminal for server-side errors
- Monitor Supabase dashboard for database issues
- Use Next.js built-in error reporting

---

## 📚 Additional Resources

### Documentation Files
- `README.md` - Project overview
- `QUICK_START.md` - Quick setup guide
- `DATABASE.md` - Database documentation
- `SUPABASE_SETUP.md` - Supabase setup guide
- `TROUBLESHOOTING.md` - Common issues and solutions

### External Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Player Documentation](https://github.com/cookpete/react-player)

### Support
- Check GitHub Issues for known problems
- Review troubleshooting documentation
- Test with provided debug scripts
- Check Supabase project status

---

## 📝 Changelog

### Version 0.1.0
- Initial release
- Basic streaming functionality
- Admin dashboard
- User authentication
- Database integration
- Mobile support

---

*This documentation is maintained alongside the codebase. Please update it when making changes to the project.*
