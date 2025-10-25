# Scope Media Platform

A modern media streaming platform built with Next.js 15, featuring live streams and archived video content.

## 🚀 Features

- ✨ Live streaming support with RTMP and YouTube integration
- 📹 Archived video library with custom categories
- 🎨 Beautiful, responsive UI with Framer Motion animations
- 📱 Mobile-friendly design
- 🔍 Advanced filtering by month and category
- 🎥 Custom video player with React Player
- 👨‍💼 Admin dashboard for content management
- 💾 File-based database system (JSON storage)

## 📦 Tech Stack

- **Framework:** Next.js 15 with Turbopack
- **UI:** React 19, Tailwind CSS 4
- **Animations:** Framer Motion
- **Video Player:** React Player
- **Icons:** Lucide React
- **Database:** File-based JSON storage
- **Language:** TypeScript

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Nopeking/Scope-Media.git
cd media-platform
```

2. Install dependencies:
```bash
npm install
```

3. Seed the database with default content:
```bash
npm run seed
```

This will create:
- Default equestrian video (Class 6B Novice from Emirates Longines League)
- Empty streams collection
- Default custom categories

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
media-platform/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx        # Homepage
│   │   ├── live/           # Live streams page
│   │   ├── past-shows/     # Archived videos page
│   │   ├── admin/          # Admin dashboard
│   │   └── api/            # API routes
│   ├── components/         # Reusable React components
│   └── types/              # TypeScript type definitions
├── data/                   # Database (JSON files)
│   ├── streams.json        # Live streams data
│   ├── videos.json         # Archived videos data
│   └── titles.json         # Custom categories
├── scripts/
│   └── seed-data.js        # Database seeding script
├── public/                 # Static assets
└── [config files]
```

## 🎯 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with default content

## 📖 Usage

### Public Pages

1. **Homepage** (`/`)
   - Featured live streams
   - Recent archived videos
   - Quick access to all content

2. **Live Streams** (`/live`)
   - View all currently active live streams
   - Auto-play featured stream
   - Real-time viewer counts

3. **Past Shows** (`/past-shows`)
   - Browse archived video library
   - Filter by month
   - Organized by custom categories

### Admin Dashboard

Access the admin panel at `/admin/dashboard` to:

- ✅ Add live streams (RTMP or YouTube URLs)
- ✅ Upload archived videos
- ✅ Create custom categories
- ✅ Manage all content
- ✅ Delete streams/videos
- ✅ Upload custom thumbnails

#### Adding Content

1. **Live Stream:**
   - Click "Add Stream"
   - Enter title and URL
   - Optionally upload custom thumbnail
   - Supports RTMP and YouTube live URLs

2. **Archived Video:**
   - Click "Upload Video"
   - Enter title and YouTube URL
   - Select category (custom title)
   - Optionally upload custom thumbnail

3. **Custom Category:**
   - Click "Add Title"
   - Enter category name
   - Use for organizing videos

## 💾 Database

The platform uses a file-based JSON database stored in the `/data` folder:

- **Simple:** No external database setup required
- **Persistent:** Data survives server restarts
- **Editable:** JSON files can be manually edited
- **Backed up:** Easy to backup (just copy `/data` folder)

### Default Content

The platform comes with a default video:
- **Title:** Class 6B Novice
- **Category:** Emirates Longines League - (Arena 2) Butheeb Equestrian Academy
- **URL:** [YouTube Live Stream](https://youtube.com/live/uR2vU5AxZMk)

Run `npm run seed` to restore default content anytime.

## 🔒 Security Notes

⚠️ **Current Version:**
- No authentication implemented
- Admin dashboard is publicly accessible
- File uploads are stored as base64 in database

🔐 **For Production:**
- Add authentication (e.g., NextAuth.js)
- Implement user roles and permissions
- Move to proper database (PostgreSQL, MongoDB)
- Add file upload to cloud storage (AWS S3, Cloudinary)
- Implement rate limiting
- Add HTTPS

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - Get started quickly
- [Database Documentation](./DATABASE.md) - Database structure and API

## 🚀 Deployment

### Vercel (Recommended for Next.js)

⚠️ Note: Vercel has read-only filesystem. For production:
1. Upgrade to PostgreSQL or MongoDB
2. Or use Vercel KV/Postgres
3. Or deploy to VPS with writable filesystem

### VPS/Dedicated Server

Works perfectly on:
- DigitalOcean
- AWS EC2
- Google Cloud Compute
- Azure VM

Steps:
1. Clone repository
2. Install dependencies
3. Run `npm run seed`
4. Run `npm run build`
5. Run `npm start`
6. Ensure `/data` directory is writable

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and not licensed for public use.

## 👨‍💻 Author

Built for Scope Media

## 🔗 Links

- Repository: [https://github.com/Nopeking/Scope-Media](https://github.com/Nopeking/Scope-Media)
- Default Video: [Emirates Longines League - Class 6B Novice](https://youtube.com/live/uR2vU5AxZMk)

---

**Need Help?** Check the [Quick Start Guide](./QUICK_START.md) or [Database Documentation](./DATABASE.md)
