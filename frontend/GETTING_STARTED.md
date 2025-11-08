# Getting Started with Xchange Frontend

## Prerequisites Check

### 1. Check if Node.js is installed

Open your terminal/command prompt and type:

```bash
node --version
```

**Expected output:** `v18.x.x` or higher (e.g., `v18.17.0`, `v20.10.0`)

If you get an error, you need to install Node.js:
- Download from: https://nodejs.org/
- Choose the LTS (Long Term Support) version
- Install and restart your terminal

### 2. Check if npm is installed

```bash
npm --version
```

**Expected output:** `9.x.x` or higher (e.g., `9.8.1`, `10.2.3`)

npm comes with Node.js, so if Node.js is installed, npm should be too.

---

## 🚀 Step-by-Step: Running the Frontend

### Step 1: Open Terminal/Command Prompt

**On Windows:**
- Press `Win + R`
- Type `cmd` or `powershell`
- Press Enter

**On Mac:**
- Press `Cmd + Space`
- Type `terminal`
- Press Enter

**On Linux:**
- Press `Ctrl + Alt + T`

---

### Step 2: Navigate to the Project Directory

In the terminal, type these commands **one at a time**:

```bash
# Navigate to the xchange-egypt directory
cd /path/to/xchange-egypt

# Then navigate to the frontend folder
cd frontend
```

**Replace `/path/to/xchange-egypt` with the actual location** where you cloned the repository.

For example:
- Windows: `cd C:\Users\YourName\Projects\xchange-egypt\frontend`
- Mac/Linux: `cd ~/Projects/xchange-egypt/frontend`

**To verify you're in the right directory:**

```bash
# List files in current directory
ls       # Mac/Linux
dir      # Windows
```

**You should see:**
- `package.json`
- `app/`
- `components/`
- `lib/`
- etc.

---

### Step 3: Install Dependencies

This step downloads all the required packages (React, Next.js, etc.)

```bash
npm install
```

**What you'll see:**
```
npm WARN deprecated ...
added 324 packages, and audited 325 packages in 45s

125 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**This will take 1-3 minutes** depending on your internet speed.

**What's happening:**
- npm is downloading all packages from the internet
- Creating a `node_modules` folder with all dependencies
- Creating a `package-lock.json` file

**If you see errors:**
- Try: `npm cache clean --force` then `npm install` again
- Or: Delete `node_modules` folder and try again

---

### Step 4: Start the Development Server

```bash
npm run dev
```

**What you'll see:**
```
> @xchange/frontend@0.1.0 dev
> next dev

   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.3s
```

**This means:**
- ✅ Server is running successfully
- 🌐 Frontend is accessible at `http://localhost:3000`
- 📁 Using environment variables from `.env.local`

**Keep this terminal window open!** The server needs to keep running.

---

### Step 5: Open in Browser

1. **Open your web browser** (Chrome, Firefox, Edge, Safari)
2. **Go to:** `http://localhost:3000`
3. **You should see the Xchange homepage!**

---

## 🎨 What You Should See

### Home Page (http://localhost:3000)

```
╔════════════════════════════════════════╗
║                                        ║
║              Xchange                   ║
║   منصة Xchange للتجارة الإلكترونية    ║
║                                        ║
║     [Login]        [Register]          ║
║                                        ║
║  🔄 Barter    🔨 Auctions    💬 Chat   ║
║                                        ║
║  ✅ Backend is LIVE at:                ║
║  https://xchange-egypt-production...   ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## ✅ Test the Features

### Test 1: Register a New Account

1. Click **"Register"** button
2. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `+1234567890` (optional)
   - Password: `password123`
   - Confirm Password: `password123`
3. Click **"Register"**
4. You should be redirected to `/dashboard`

**What happens behind the scenes:**
- Frontend sends POST request to: `https://xchange-egypt-production.up.railway.app/api/v1/auth/register`
- Backend creates user in database
- Backend returns JWT tokens
- Frontend saves tokens in localStorage
- Frontend redirects you to dashboard

---

### Test 2: View Dashboard

You should see:

```
╔════════════════════════════════════════╗
║  Xchange Dashboard          [Logout]   ║
╠════════════════════════════════════════╣
║  Welcome, Test User! 👋                ║
║  test@example.com                      ║
║  🟢 WebSocket: Connected               ║
║  [USER] badge                          ║
╠════════════════════════════════════════╣
║  📸 Image Upload                       ║
║  [Upload Images]                       ║
╠════════════════════════════════════════╣
║  💬 Real-time Chat                     ║
║  ✅ Connected to WebSocket server      ║
║  [Send Test Message]                   ║
╠════════════════════════════════════════╣
║  🔌 API Connection                     ║
║  Backend URL: https://xchange...       ║
║  WebSocket URL: https://xchange...     ║
║  Authentication: ✅ Active             ║
╚════════════════════════════════════════╝
```

---

### Test 3: Upload an Image

1. Click **"Upload Images"** button
2. Select 1-5 images from your computer
   - Must be JPEG, PNG, or WebP
   - Max 5MB per image
3. Click "Open"
4. Wait for upload (you'll see "Uploading...")
5. Uploaded images will appear in a grid below

**Behind the scenes:**
- Frontend sends multipart/form-data to backend
- Backend saves images to `/uploads/` folder
- Backend returns image URLs
- Frontend displays the uploaded images

---

### Test 4: WebSocket Connection

1. Look for **"WebSocket: Connected"** with green dot 🟢
2. Click **"Send Test Message"** button
3. Open browser console (F12 → Console tab)
4. You should see log messages about the WebSocket connection

**To open Console:**
- **Chrome/Edge:** Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- **Firefox:** Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

---

## 🛑 How to Stop the Server

When you're done testing:

1. Go back to the terminal where `npm run dev` is running
2. Press `Ctrl + C`
3. Type `Y` if asked to confirm
4. Server will stop

---

## 🔧 Common Issues and Solutions

### Issue 1: "npm: command not found"

**Problem:** Node.js is not installed

**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install it
3. Restart your terminal
4. Try again

---

### Issue 2: "Port 3000 is already in use"

**Problem:** Another app is using port 3000

**Solution Option 1:** Stop the other app

**Solution Option 2:** Use a different port
```bash
PORT=3001 npm run dev
```
Then visit `http://localhost:3001`

---

### Issue 3: White/Blank Page

**Problem:** JavaScript error or build issue

**Solution:**
1. Open browser console (F12)
2. Look for red error messages
3. Most common fix:
   ```bash
   # Stop the server (Ctrl+C)
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

---

### Issue 4: "Failed to fetch" or Network Errors

**Problem:** Backend is not accessible

**Solution:**
1. Check if backend is running: Visit https://xchange-egypt-production.up.railway.app/
2. Check `.env.local` file has correct URLs
3. Check your internet connection
4. Check browser console for CORS errors

---

### Issue 5: Authentication Not Working

**Problem:** Tokens not being saved or backend rejecting requests

**Solutions:**
1. **Clear browser data:**
   - Open DevTools (F12)
   - Application tab → Storage → Clear site data
   - Refresh page

2. **Check localStorage:**
   - DevTools → Application → Local Storage
   - Should see `accessToken` and `refreshToken`

3. **Check backend is running:**
   - Visit https://xchange-egypt-production.up.railway.app/health
   - Should return JSON with status: "ok"

---

### Issue 6: Images Not Uploading

**Possible causes:**
- File too large (>5MB)
- Wrong file type (not JPEG/PNG/WebP)
- Backend upload endpoint not working

**Check:**
1. File size: Right-click image → Properties → Size
2. File type: Check file extension (.jpg, .png, .webp)
3. Backend logs in Railway dashboard

---

## 📱 Accessing from Other Devices (Same Network)

Want to test on your phone or another computer on the same WiFi?

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under your WiFi adapter (e.g., `192.168.1.100`)

### Step 2: Start Server with Host Flag

```bash
npm run dev -- -H 0.0.0.0
```

### Step 3: Access from Other Device

On your phone or other device, open browser and go to:
```
http://YOUR_IP:3000
```

Example: `http://192.168.1.100:3000`

**Important:** Both devices must be on the same WiFi network!

---

## 🔍 Viewing Developer Tools

To debug or inspect the app:

### Open DevTools:
- **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I`
- **Firefox:** Press `F12`
- **Safari:** Enable "Show Develop menu" in Preferences, then press `Cmd+Option+I`

### Useful Tabs:

**Console Tab:**
- See JavaScript logs
- See API request errors
- See WebSocket messages

**Network Tab:**
- See all HTTP requests
- See API calls to backend
- Check request/response data
- Look for failed requests (red)

**Application Tab:**
- See localStorage (where tokens are stored)
- See cookies
- Clear site data

**Elements Tab:**
- Inspect HTML elements
- See applied CSS styles
- Modify page in real-time

---

## 📊 Understanding the Terminal Output

When you run `npm run dev`, you might see:

```
> @xchange/frontend@0.1.0 dev
> next dev

   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.3s
 ○ Compiling / ...
 ✓ Compiled / in 1.5s
 GET / 200 in 1523ms
 ○ Compiling /login ...
 ✓ Compiled /login in 432ms
 GET /login 200 in 445ms
```

**What this means:**

| Message | Meaning |
|---------|---------|
| `✓ Ready in 2.3s` | Server started successfully |
| `○ Compiling /` | Next.js is building the page |
| `✓ Compiled / in 1.5s` | Page built successfully |
| `GET / 200 in 1523ms` | Page loaded (200 = success) |

**Error indicators:**
- `✗` - Something failed
- `500` - Server error
- `404` - Page not found
- Red text - Error message (read carefully!)

---

## 🎓 Next Steps After Running Locally

Once you have it running:

1. **Explore the code:**
   - Open `frontend/` in VS Code or your favorite editor
   - Look at `app/page.tsx` to see the home page code
   - Modify text and see changes in real-time (Hot reload!)

2. **Make changes:**
   - Edit any `.tsx` file
   - Save it
   - Browser automatically refreshes!

3. **Add features:**
   - Create new pages in `app/`
   - Add new components in `components/`
   - Add new API calls in `lib/api/`

4. **Deploy:**
   - When ready, deploy to Vercel (see deployment guide)

---

## 📚 Helpful Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

## ✅ Quick Reference Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Stop server
Ctrl + C

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🆘 Still Having Issues?

If you're stuck:

1. **Check the terminal output** for error messages
2. **Check browser console** (F12) for JavaScript errors
3. **Read the error message carefully** - it usually tells you what's wrong
4. **Try restarting:**
   ```bash
   # Stop server (Ctrl+C)
   # Delete cache
   rm -rf .next
   # Start again
   npm run dev
   ```

5. **Ask for help** with:
   - The exact error message
   - What you were trying to do
   - Screenshot of terminal output
   - Screenshot of browser console

---

## 🎉 You're All Set!

You should now have the Xchange frontend running locally and connecting to the live backend on Railway!

**Summary:**
- ✅ Frontend: `http://localhost:3000`
- ✅ Backend: `https://xchange-egypt-production.up.railway.app`
- ✅ Ready to register, login, upload images, and use chat!

Happy coding! 🚀
