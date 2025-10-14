# Troubleshooting Guide

## React Hydration Mismatch Errors

If you see hydration errors in the console with messages about `bis_skin_checked="1"` or other unexpected attributes:

### Cause

This error is typically caused by **browser extensions** that modify the DOM before React can hydrate. Common culprits:

- **Bitdefender TrafficLight**
- **Avast/AVG Web Shield**
- **Kaspersky Protection**
- **Grammarly**
- **LastPass**
- **Any ad blockers or security extensions**

### Solution 1: Disable Browser Extensions (Recommended for Development)

1. **Open your browser in Incognito/Private mode** (extensions are usually disabled)
   - Chrome: `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
   - Firefox: `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)
   - Edge: `Ctrl + Shift + N`

2. **Or disable specific extensions:**
   - Chrome: `chrome://extensions`
   - Firefox: `about:addons`
   - Edge: `edge://extensions`

Look for these and temporarily disable:
- Bitdefender TrafficLight
- Any antivirus web protection
- Ad blockers
- Password managers
- Grammar checkers

### Solution 2: Ignore Hydration Warnings (Already Implemented)

We've added `suppressHydrationWarning` to components. This suppresses the warnings without affecting functionality.

### Solution 3: Clear Browser Cache

Sometimes cached HTML can cause mismatches:

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Solution 4: Check for Code Issues

If the error persists even in incognito mode, check for:

1. **Date/Time Usage:**
   ```tsx
   // ❌ Bad - causes mismatch
   <div>{new Date().toLocaleString()}</div>
   
   // ✅ Good - only runs on client
   const [time, setTime] = useState('');
   useEffect(() => {
     setTime(new Date().toLocaleString());
   }, []);
   ```

2. **Random Values:**
   ```tsx
   // ❌ Bad
   <div id={Math.random()}>
   
   // ✅ Good
   const [id, setId] = useState('');
   useEffect(() => {
     setId(Math.random().toString());
   }, []);
   ```

3. **Browser-Only APIs:**
   ```tsx
   // ❌ Bad
   const width = window.innerWidth;
   
   // ✅ Good
   const [width, setWidth] = useState(0);
   useEffect(() => {
     setWidth(window.innerWidth);
   }, []);
   ```

## Other Common Issues

### Data Not Showing

**Issue:** Content added in admin doesn't appear on public pages.

**Solution:**
1. Refresh the page (data fetches on mount)
2. Check browser console for API errors
3. Verify `/data` folder exists and has `.json` files
4. Check file permissions (must be writable)

### Server Not Starting

**Issue:** `npm run dev` fails or errors.

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or try clearing Next.js cache
rm -rf .next
npm run dev
```

### Port Already in Use

**Issue:** "Port 3000 is already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### TypeScript Errors

**Issue:** Type errors in IDE

**Solution:**
```bash
# Restart TypeScript server
# In VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# Or reinstall types
npm install --save-dev @types/node @types/react @types/react-dom
```

### Thumbnails Not Loading

**Issue:** Images don't appear or show broken image icon

**Solutions:**
1. **Check URL format:** Must be valid HTTPS URL
2. **YouTube URLs:** Use correct format:
   - `https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg`
   - `https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg`
3. **CORS Issues:** Some image hosts block embedding
4. **File Upload:** If using custom thumbnails, ensure base64 is valid

### Database Issues

**Issue:** Data lost or corrupted

**Solutions:**
1. **Restore from backup:**
   ```bash
   cp -r data_backup data
   ```

2. **Reset to defaults:**
   ```bash
   rm -rf data
   npm run seed
   ```

3. **Manual fix:** Edit JSON files directly:
   - Ensure valid JSON syntax
   - Use JSON validator: https://jsonlint.com

### Performance Issues

**Issue:** Slow page loads or laggy animations

**Solutions:**
1. **Reduce animation delay:** Lower `delay` prop in Framer Motion
2. **Optimize images:** Use appropriate thumbnail sizes
3. **Limit data:** Don't add thousands of videos at once
4. **Clear browser data:** Old cached data can slow things down

### Build Errors

**Issue:** `npm run build` fails

**Solutions:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Check for TypeScript errors
npm run lint

# Update dependencies
npm update
```

## Still Having Issues?

1. **Check browser console** (F12) for specific errors
2. **Check server terminal** for API errors
3. **Test in incognito mode** to rule out extensions
4. **Try different browser** (Chrome, Firefox, Edge)
5. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

## Getting Help

When reporting issues, include:
- Browser and version
- Node.js version (`node --version`)
- Error message from console
- Steps to reproduce
- Screenshots if relevant

## Quick Fixes Checklist

- [ ] Try incognito mode
- [ ] Disable browser extensions
- [ ] Clear browser cache
- [ ] Refresh the page
- [ ] Restart dev server
- [ ] Check `/data` folder exists
- [ ] Run `npm install`
- [ ] Delete `.next` folder
- [ ] Check console for errors
- [ ] Verify file permissions

---

**Most common issue:** Browser extensions modifying the DOM. **Solution:** Use incognito mode or disable extensions during development.

