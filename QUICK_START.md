# Quick Start Guide

## ✅ Your System is Ready!

Your media platform is now configured with a **file-based database** that stores all data locally in JSON files.

## How It Works

### Data Storage
All data is automatically saved to:
```
/data/
  ├── streams.json     (your live streams)
  ├── videos.json      (your archived videos)
  └── titles.json      (custom categories)
```

### What Happens When You Add Content

1. ✅ You add a stream/video in the admin dashboard
2. ✅ Data is saved to JSON file immediately
3. ✅ Data persists even after server restart
4. ✅ All users see the same data

## Testing Your Setup

1. **Start the server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open admin dashboard**:
   ```
   http://localhost:3000/admin/dashboard
   ```

3. **Test adding a live stream**:
   - Click "Add Stream"
   - Enter:
     - Title: "Test Stream"
     - URL: https://youtube.com/watch?v=dQw4w9WgXcQ
   - Click "Add"
   - ✅ Should appear in the list immediately

4. **Verify data persistence**:
   - Stop the server (Ctrl+C)
   - Check if `/data/streams.json` exists
   - Restart server: `npm run dev`
   - ✅ Your stream should still be there!

5. **Test deleting**:
   - Click the trash icon on your test stream
   - ✅ Should disappear immediately

## Console Logs

When everything works, you should see:
```
✅ Firebase initialized successfully
✅ Firestore initialized
📥 Fetching streams from file database...
✅ Fetched 0 streams
📝 Adding new stream: Test Stream
✅ Stream added successfully
✅ Stream added to UI
```

## Troubleshooting

### If Adding Doesn't Work

1. **Open Browser Console** (Press F12)
2. **Look for error messages**
3. **Common issues**:
   - ❌ "Failed to fetch" → Server not running
   - ❌ "ENOENT" → Permissions issue, restart server
   - ❌ "JSON parse error" → Delete `/data` folder and restart

### Quick Fix

If something goes wrong, try:
```bash
# Stop server (Ctrl+C)

# Delete data folder
rm -rf data     # Mac/Linux
rmdir /s data   # Windows CMD
Remove-Item -Recurse -Force data   # Windows PowerShell

# Restart server
npm run dev

# Data files will be recreated automatically
```

## Features Working Now

✅ Add live streams
✅ Add archived videos  
✅ Add custom categories
✅ Delete any content
✅ Data persists across restarts
✅ Mobile responsive design
✅ Larger logo
✅ Clean UI

## What's Different from localStorage

| Feature | localStorage (Old) | File Database (New) |
|---------|-------------------|---------------------|
| Data location | Browser only | Server files |
| Shared across devices | ❌ | ✅ |
| Survives cache clear | ❌ | ✅ |
| Multi-user support | ❌ | ✅ |
| Easy backup | ❌ | ✅ (copy `/data`) |
| Production ready | ❌ | ✅ (on VPS) |

## Backup Your Data

**Important**: Regularly backup your `/data` folder!

```bash
# Windows PowerShell
Copy-Item -Recurse data data_backup_$(Get-Date -Format 'yyyy-MM-dd')

# Mac/Linux
cp -r data data_backup_$(date +%Y-%m-%d)
```

## Next Steps

1. ✅ Test adding/deleting content
2. ✅ Verify data persists after restart
3. 📦 When ready for production, deploy to a VPS
4. 🔐 Add authentication (see DATABASE.md)
5. 🚀 Consider upgrading to PostgreSQL for production

## Need Help?

Check these files:
- `DATABASE.md` - Full database documentation
- `README.md` - Project overview
- Browser console (F12) - Error messages
- Server logs - API call logs

---

**Everything should work now!** 🎉

Go ahead and test adding a stream or video. Check your browser console for the ✅ success messages!

