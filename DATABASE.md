# Database Setup Documentation

## Overview

Your Media Platform uses a **file-based database system** for data storage. Data is stored in JSON files on your server and persists across restarts.

## Current Setup - File-Based Database

### Why File-Based?
- ✅ **Simple** - No external services required
- ✅ **Persistent** - Data survives server restarts
- ✅ **No setup needed** - Works out of the box
- ✅ **Easy to backup** - Just copy the `/data` folder
- ✅ **Human-readable** - JSON format you can edit manually
- ✅ **Free** - No cloud costs
- ✅ **Fast** - Local file access

### Storage Location
Data is stored in JSON files in the `/data` directory:
- `/data/streams.json` - Live streams data
- `/data/videos.json` - Archived videos data
- `/data/titles.json` - Custom category titles

### Data Structure

#### streams.json
```json
[
  {
    "id": "1234567890",
    "title": "Stream Title",
    "url": "rtmp://example.com/live or YouTube URL",
    "thumbnail": "https://...",
    "status": "live",
    "viewers": 150,
    "date": "10/10/2024"
  }
]
```

#### videos.json
```json
[
  {
    "id": "1234567890",
    "title": "Video Title",
    "url": "https://youtube.com/watch?v=...",
    "thumbnail": "https://...",
    "duration": "00:00",
    "uploadDate": "10/10/2024",
    "customTitle": "Tech Conferences",
    "month": "October 2024"
  }
]
```

#### titles.json
```json
[
  "Tech Conferences",
  "Cooking Shows",
  "Music Events"
]
```

### API Endpoints

#### Live Streams API (`/api/streams`)
- **GET** `/api/streams` - Fetch all live streams
- **POST** `/api/streams` - Add a new live stream
- **DELETE** `/api/streams?id={streamId}` - Delete a stream

#### Videos API (`/api/videos`)
- **GET** `/api/videos` - Fetch all archived videos
- **POST** `/api/videos` - Add a new video
- **DELETE** `/api/videos?id={videoId}` - Delete a video

#### Titles API (`/api/titles`)
- **GET** `/api/titles` - Fetch all custom titles
- **POST** `/api/titles` - Add a new title
- **DELETE** `/api/titles?title={titleName}` - Delete a title

## Benefits

✅ **Persistent Storage**: Data survives server restarts
✅ **Centralized**: All users see the same data
✅ **Easy Backup**: Just copy `/data` folder
✅ **No Setup**: Works immediately
✅ **Free**: No cloud costs
✅ **Fast**: Local file access

## Data Persistence

The `/data` directory is:
- ✅ Created automatically on first run
- ✅ Excluded from Git (in `.gitignore`)
- ✅ Safe for backups
- ✅ Human-readable JSON format
- ✅ Editable manually if needed

## Backup Your Data

To backup your data, simply copy the `/data` folder:

```bash
# Windows
xcopy /E /I data data_backup

# Mac/Linux
cp -r data data_backup
```

## Restore Data

To restore from backup:

```bash
# Windows
xcopy /E /I data_backup data

# Mac/Linux
cp -r data_backup data
```

## Manual Data Editing

You can manually edit the JSON files if needed:

1. Stop your server
2. Open `/data/streams.json` (or other files) in a text editor
3. Make your changes (ensure valid JSON)
4. Save the file
5. Restart your server

**Note**: Be careful to maintain valid JSON format!

## How It Works

### When You Add Content:
1. Admin dashboard sends POST request to API
2. API reads existing data from JSON file
3. API adds new item to array
4. API writes updated array back to JSON file
5. Dashboard updates UI immediately

### When You Delete Content:
1. Admin dashboard sends DELETE request to API
2. API reads existing data from JSON file
3. API filters out the item with matching ID
4. API writes filtered array back to JSON file
5. Dashboard removes item from UI

### When You Load Page:
1. Dashboard sends GET request to API
2. API reads data from JSON files
3. API returns data as JSON response
4. Dashboard displays all content

## Troubleshooting

### Issue: Data not persisting
**Solutions:**
1. Check if `/data` directory exists
2. Verify file permissions (must be writable)
3. Check server logs for errors
4. Ensure disk has free space

### Issue: Cannot add data
**Solutions:**
1. Open browser console (F12)
2. Look for error messages
3. Check network tab for API call status
4. Verify server is running

### Issue: "Cannot read property" error
**Solutions:**
1. Check if JSON files have valid format
2. Delete `/data` folder and restart server
3. Files will be recreated automatically

### Issue: Data disappeared
**Solutions:**
1. Check if `/data` folder still exists
2. Restore from backup if available
3. Check if files were accidentally deleted

## Development

### Local Development
```bash
npm run dev
```

Data is stored in `/data` folder in your project directory.

### Testing
For testing, you can:
1. Make a backup of `/data` folder
2. Test your changes
3. Restore backup if needed

## Production Deployment

### Deployment Platforms

#### Vercel (Recommended)
⚠️ **Note**: Vercel has read-only filesystem. For production on Vercel, you'll need to upgrade to a database like:
- PostgreSQL (Vercel Postgres)
- MongoDB Atlas
- Firebase Firestore
- Supabase

#### VPS/Dedicated Server
Works perfectly on:
- DigitalOcean
- AWS EC2
- Google Cloud Compute
- Azure VM
- Any VPS with writable filesystem

Steps:
1. Deploy your code
2. Ensure `/data` directory is writable
3. Set up regular backups
4. Monitor disk space

### File Permissions

Ensure the `/data` directory has proper permissions:

```bash
# Linux/Mac
chmod 755 data
chmod 644 data/*.json

# Windows - usually no action needed
```

## Upgrading to a Real Database (Optional)

For high-traffic production or cloud deployment, consider upgrading to:

### PostgreSQL (Recommended for Production)
```bash
npm install pg
```

### MongoDB
```bash
npm install mongodb
```

### Firebase Firestore (Cloud)
```bash
npm install firebase
```

### Supabase (Open Source Alternative)
```bash
npm install @supabase/supabase-js
```

## Security Considerations

### Current Security
- ⚠️ No authentication required
- ⚠️ Anyone can access admin dashboard
- ⚠️ File-based database is not concurrent-safe at high scale

### Recommendations for Production:
1. **Add Authentication**: Use NextAuth.js
2. **Add Authorization**: Protect admin routes
3. **Add Validation**: Validate all inputs
4. **Rate Limiting**: Prevent abuse
5. **HTTPS**: Use SSL certificate
6. **Upgrade Database**: Use PostgreSQL/MongoDB

## Monitoring

Monitor your data:
- File sizes: Check `/data/*.json` sizes
- Disk space: Ensure adequate free space
- Logs: Check server logs for errors
- Backups: Schedule regular backups

## Cost

✅ **$0** - Completely free, no cloud costs!

## Performance

### Current Performance
- **Fast**: Local file access
- **Scalable**: Up to ~10,000 records
- **Limitations**: Not suitable for:
  - High-traffic sites (1000+ concurrent users)
  - Real-time collaboration
  - Multiple server instances

### When to Upgrade
Upgrade to a real database when:
- You have 1000+ daily active users
- You need real-time sync
- You deploy to serverless (Vercel)
- You need multi-server deployment

---

**Current Status**: ✅ Fully configured and working!

Your data is stored locally in JSON files and persists across server restarts.
