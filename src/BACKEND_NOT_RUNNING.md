# ⚠️ Backend Not Running - How to Fix

## 🎯 What's Happening?

You're seeing these errors:
```
❌ [LOCAL] Backend health check failed: TypeError: Failed to fetch
⚠️ [LOCAL] Backend not available, using stored data only
```

**This is completely normal!** It just means you haven't started the backend server yet.

---

## ⚡ Quick Fix (30 Seconds)

### **Windows Users (Easiest):**

1. Find the file **`start-backend.bat`** in your project folder
2. **Double-click it**
3. A black terminal window will open
4. Wait for this message:
   ```
   ✅ Server running on: http://localhost:5000
   🚀 Ready to accept video uploads!
   ```
5. **Done!** Refresh your browser

---

### **Mac/Linux Users:**

1. Open **Terminal**
2. Run these commands:
   ```bash
   cd local-backend
   npm install
   npm start
   ```
3. Wait for:
   ```
   ✅ Server running on: http://localhost:5000
   🚀 Ready to accept video uploads!
   ```
4. **Done!** Refresh your browser

---

## ✅ How to Know It's Fixed

### **1. Yellow Banner Disappears**
The yellow "Backend Not Running" banner at the top of your app will disappear automatically!

### **2. Browser Console Shows Success**
Press `F12` in your browser, you'll see:
```
✅ BACKEND CONNECTED!
🎬 Video uploads are now enabled
```

### **3. Upload Button Works**
Click your profile → Upload Video button now works!

---

## 🎬 Visual Guide

### **Before (Backend OFF):**
```
❌ Yellow banner visible
❌ Upload disabled
❌ Console shows "Failed to fetch"
```

### **After (Backend ON):**
```
✅ No banner
✅ Upload enabled
✅ Console shows "BACKEND CONNECTED!"
```

---

## 💡 Pro Tips

### **Keep Terminal Open**
- Don't close the terminal window where the backend is running
- Minimize it if you want, but keep it open
- If you close it, the backend stops

### **Run Two Terminals**
You need **two terminal windows** running at the same time:

**Terminal 1 - Backend:**
```bash
cd local-backend
npm start
```
→ Keep this running

**Terminal 2 - Frontend:**
```bash
npm start
```
→ Keep this running too

---

## 🔍 Troubleshooting

### **"npm: command not found"**

**Fix:** Install Node.js from https://nodejs.org/

### **"Port 5000 already in use"**

**Option 1 - Kill the existing process:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Option 2 - Use a different port:**
Edit `/local-backend/server.js`:
```javascript
const PORT = 5001; // Changed from 5000
```

Then edit `/services/localBackendApi.ts`:
```typescript
const LOCAL_BACKEND_URL = 'http://localhost:5001';
```

### **"Cannot find module 'express'"**

**Fix:** Install dependencies:
```bash
cd local-backend
npm install
```

### **Still not working?**

1. Close all terminals
2. Delete `local-backend/node_modules`
3. Run:
   ```bash
   cd local-backend
   npm install
   npm start
   ```
4. Refresh your browser

---

## 📚 Additional Resources

- **[QUICK_FIX.md](./QUICK_FIX.md)** - Detailed startup guide
- **[START_HERE.md](./START_HERE.md)** - Quick start (2 steps)
- **[BACKEND_SETUP_INSTRUCTIONS.md](./BACKEND_SETUP_INSTRUCTIONS.md)** - Full documentation

---

## 🎉 That's It!

Once you see "Server running on: http://localhost:5000", you're all set! The yellow banner will disappear and you can start uploading videos! 🚀

**Need more help?** Check the browser console (F12) for detailed logs.
