# Quick Start Guide

## Error: ERR_CONNECTION_REFUSED

This means your backend server is not running. Follow these steps:

## Step 1: Install Backend Dependencies (if not done)

```bash
cd backend
npm install
```

## Step 2: Set Up Environment Variables

```bash
# Copy the example file
cp env.example .env

# Edit .env and set:
MONGODB_URI=mongodb://localhost:27017/truco_game
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this
FRONTEND_URL=http://localhost:8080
```

## Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (Run as Administrator)
net start MongoDB

# Or start manually:
mongod --dbpath "C:\data\db"
```

**Option B: MongoDB Atlas (Cloud)**
- Use connection string in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/truco_game
```

## Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Default admin user created (admin@truco.com / admin123)
🚀 Server running on port 3000
```

## Step 5: Verify Backend is Running

Open browser or use curl:
```
http://localhost:3000/health
```

Should return:
```json
{"status":"ok","message":"Truco Admin API is running"}
```

## Step 6: Start Frontend (in separate terminal)

```bash
# In project root
npm run dev
```

Frontend should now connect to backend at `http://localhost:3000/api`

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Check port 3000 is not already in use
- Check `.env` file exists and has correct values

### Still getting ERR_CONNECTION_REFUSED
- Make sure backend server is actually running (check terminal)
- Verify backend is on port 3000
- Check firewall isn't blocking port 3000

### MongoDB connection error
- See `MONGODB_SETUP.md` for detailed MongoDB setup


