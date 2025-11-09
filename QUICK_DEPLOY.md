# ⚡ Quick Deployment Guide

Fast deployment steps for Truco Admin Panel.

## 🚀 Frontend Deployment

### Step 1: Set Environment Variable
Create `.env.production` file in root directory:
```env
VITE_API_URL=https://your-backend-api.com/api
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Deploy

**Vercel:**
```bash
npm run deploy:vercel
```

**Netlify:**
```bash
npm run deploy:netlify
```

**Or upload `dist/` folder to any static hosting**

---

## 🔌 Backend Deployment

### Step 1: Set Environment Variables
Create `backend/.env` file:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_min_32_chars
FRONTEND_URL=https://your-frontend-domain.com
```

### Step 2: Deploy

**Railway/Render:**
- Connect GitHub repo
- Set environment variables
- Deploy automatically

**VPS with PM2:**
```bash
cd backend
npm install --production
npm run start:pm2
```

**Docker:**
```bash
cd backend
docker-compose up -d
```

---

## ✅ Verify Deployment

1. **Frontend:** Open your deployed URL
2. **Backend:** Check `https://your-api.com/health`
3. **Test Login:** Use admin credentials
4. **Check API:** Verify API calls work

---

## 📚 Full Guide

See `DEPLOYMENT.md` for detailed instructions.

---

**🎉 Done! Your app is deployed!**

