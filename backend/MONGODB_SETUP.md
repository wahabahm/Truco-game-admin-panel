# MongoDB Setup Guide

## Issue: Connection Refused Error

If you see `connect ECONNREFUSED ::1:27017`, it means MongoDB is not running.

## Solutions

### Option 1: Install and Run MongoDB Locally

1. **Download MongoDB:**
   - Visit: https://www.mongodb.com/try/download/community
   - Download and install MongoDB Community Server

2. **Start MongoDB Service:**
   ```bash
   # Windows (Run as Administrator)
   net start MongoDB
   
   # Or start manually:
   mongod --dbpath "C:\data\db"
   ```

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   # Should connect to MongoDB shell
   ```

### Option 2: Use MongoDB Atlas (Cloud - Recommended)

1. **Create free account:**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for free (M0 cluster)

2. **Create a cluster:**
   - Click "Build a Database"
   - Choose free tier (M0)
   - Select region closest to you

3. **Create database user:**
   - Go to "Database Access"
   - Add new user
   - Set username and password

4. **Get connection string:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string

5. **Update .env file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/truco_game?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your database user credentials.

### Option 3: Use Docker (If you have Docker)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Quick Test

After MongoDB is running, test the connection:

```bash
# Test MongoDB connection
mongosh
# Or
mongo
```

Then in the MongoDB shell:
```javascript
show dbs
exit
```

## Update Your .env File

Make sure your `.env` file has:
```env
MONGODB_URI=mongodb://localhost:27017/truco_game
```

Or for MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/truco_game
```

## After Setup

1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. You should see:
   ```
   ✅ MongoDB connected successfully
   ✅ Default admin user created (admin@truco.com / admin123)
   ```


