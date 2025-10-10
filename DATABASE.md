# Database Setup Documentation

## Overview

Your Media Platform now uses a **file-based database system** instead of browser localStorage. Data is stored persistently on the server and synced across all devices and users.

## Current Setup

### Storage Location
- Data is stored in JSON files in the `/data` directory
- Files created:
  - `/data/streams.json` - Live streams data
  - `/data/videos.json` - Archived videos data
  - `/data/titles.json` - Custom category titles

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

✅ **Persistent Storage**: Data survives browser cache clearing
✅ **Centralized**: All users see the same data
✅ **Device Independent**: Access from any device
✅ **Backup Ready**: Easy to backup `/data` folder
✅ **Production Ready**: Can be deployed to any hosting platform

## Data Persistence

The `/data` directory is:
- ✅ Created automatically on first run
- ✅ Excluded from Git (in `.gitignore`)
- ✅ Safe for backups
- ✅ Human-readable JSON format

## Upgrading to a Real Database (Optional)

For production or larger scale, you can upgrade to:

### PostgreSQL
```bash
npm install pg
# Update API routes to use PostgreSQL client
```

### MongoDB
```bash
npm install mongodb
# Update API routes to use MongoDB client
```

### Prisma (Recommended)
```bash
npm install prisma @prisma/client
npx prisma init
# Create schema and update API routes
```

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

## Data Structure

### Live Stream Object
```json
{
  "id": "1234567890",
  "title": "Stream Title",
  "url": "rtmp://example.com/live or YouTube URL",
  "thumbnail": "https://...",
  "status": "live",
  "viewers": 150,
  "date": "10/10/2024"
}
```

### Archived Video Object
```json
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
```

### Custom Title
```json
"Tech Conferences"
```

## Troubleshooting

### Data not persisting
- Check if `/data` directory exists
- Verify file permissions
- Check server logs for errors

### Cannot delete data
- Verify the ID or title matches exactly
- Check server logs for DELETE request errors

### API errors
- Restart your dev server: `npm run dev`
- Clear browser cache
- Check console for error messages

## Development

When developing locally:
1. Run `npm run dev`
2. Data is stored in `/data` folder
3. Changes persist between server restarts
4. Multiple developers need separate databases or shared file storage

## Production Deployment

When deploying to production:
1. Ensure `/data` directory is writable
2. Consider moving to a proper database (PostgreSQL/MongoDB)
3. Set up regular backups
4. Use environment variables for configuration

---

**Note**: The current file-based system is perfect for small to medium applications. For high-traffic production use, consider upgrading to PostgreSQL or MongoDB.

