# 🚀 Deployment Guide - Truco Admin Panel

Complete deployment guide for frontend and backend on various platforms.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud like MongoDB Atlas)
- Git repository
- Environment variables configured

## 🔧 Pre-Deployment Setup

### 1. Frontend Environment Variables

Create `.env.production` file in the root directory:

```env
VITE_API_URL=https://your-backend-api-domain.com/api
```

**Important:** Replace `https://your-backend-api-domain.com/api` with your actual backend API URL.

### 2. Backend Environment Variables

Create `.env` file in `backend/` directory:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# MongoDB Connection (use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truco_game?retryWrites=true&w=majority

# JWT Secret (generate a strong secret - min 32 characters)
JWT_SECRET=your_strong_secret_key_here_min_32_characters

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Multiple frontend URLs (comma-separated)
# FRONTEND_URLS=https://domain1.com,https://domain2.com
```

### 3. Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET` in your `.env` file.

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-api.com/api`

4. **Redeploy** after setting environment variables

**Configuration:** Already configured in `vercel.json`

---

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

3. **Set Environment Variables:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-api.com/api`

4. **Redeploy** after setting environment variables

**Configuration:** Already configured in `netlify.toml`

---

### Option 3: Railway

1. **Connect GitHub repository to Railway**

2. **Create new project** and select your repository

3. **Set Environment Variables:**
   - `VITE_API_URL` = `https://your-backend-api.com/api`

4. **Deploy** - Railway will automatically detect and deploy

**Configuration:** Already configured in `railway.json`

---

### Option 4: Render

1. **Create Static Site** on Render

2. **Connect your repository**

3. **Build Settings:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

4. **Set Environment Variables:**
   - `VITE_API_URL` = `https://your-backend-api.com/api`

---

### Option 5: Traditional VPS/Server (Nginx)

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Copy `dist` folder to server:**
   ```bash
   scp -r dist/* user@your-server:/var/www/truco-admin
   ```

3. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/truco-admin;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /assets {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🔌 Backend Deployment

### Option 1: Railway (Recommended)

1. **Create new project** on Railway

2. **Connect your repository** and select `backend/` folder

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_secret
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **Deploy** - Railway will automatically detect Node.js and deploy

---

### Option 2: Render

1. **Create Web Service** on Render

2. **Connect your repository**

3. **Build Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_secret
   FRONTEND_URL=https://your-frontend-domain.com
   ```

---

### Option 3: Vercel (Serverless)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from backend directory:**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel Dashboard

**Note:** You may need to adjust the server code for serverless compatibility.

---

### Option 4: Traditional VPS/Server (PM2)

1. **SSH into your server**

2. **Clone repository:**
   ```bash
   git clone your-repo-url
   cd truco-admin-panel/backend
   ```

3. **Install dependencies:**
   ```bash
   npm install --production
   ```

4. **Create `.env` file:**
   ```bash
   cp env.example .env
   nano .env
   # Edit with your production values
   ```

5. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

6. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx as reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Set up SSL:**
   ```bash
   sudo certbot --nginx -d api.your-domain.com
   ```

---

### Option 5: Docker Deployment

1. **Build Docker image:**
   ```bash
   cd backend
   docker build -t truco-api .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Or run standalone:**
   ```bash
   docker run -d \
     --name truco-api \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e MONGODB_URI=your_mongodb_uri \
     -e JWT_SECRET=your_secret \
     -e FRONTEND_URL=https://your-frontend.com \
     truco-api
   ```

---

## 🗄️ MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create cluster** (Free tier available)

3. **Create database user**

4. **Whitelist IP addresses** (or `0.0.0.0/0` for all)

5. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/truco_game?retryWrites=true&w=majority
   ```

6. **Use in backend `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truco_game?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

For local development only. Not recommended for production.

---

## ✅ Post-Deployment Checklist

### Frontend
- [ ] Environment variables set correctly
- [ ] API URL points to deployed backend
- [ ] Build completes successfully
- [ ] All routes work (SPA routing)
- [ ] Assets load correctly
- [ ] SSL/HTTPS configured

### Backend
- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] JWT secret is strong (32+ characters)
- [ ] CORS configured for frontend URL
- [ ] Health check endpoint working (`/health`)
- [ ] API documentation accessible (`/api-docs`)
- [ ] SSL/HTTPS configured
- [ ] Default admin password changed

### Security
- [ ] Changed default admin credentials
- [ ] Strong JWT secret set
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Environment variables not exposed in code
- [ ] Database credentials secure

---

## 🔍 Troubleshooting

### Frontend Issues

**Build fails:**
- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors

**API calls fail:**
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration on backend
- Check browser console for errors

**Routes not working:**
- Verify SPA routing configuration
- Check `_redirects` file (Netlify)
- Check `vercel.json` routes (Vercel)

### Backend Issues

**Server won't start:**
- Check MongoDB connection
- Verify environment variables
- Check port availability
- Check logs for errors

**CORS errors:**
- Verify `FRONTEND_URL` in backend `.env`
- Check allowed origins in server code
- Verify frontend URL matches exactly

**Database connection fails:**
- Verify MongoDB URI
- Check network connectivity
- Verify MongoDB Atlas IP whitelist
- Check database credentials

---

## 📞 Support

For deployment issues, check:
1. Environment variables are set correctly
2. MongoDB connection is working
3. CORS configuration matches frontend URL
4. Ports are accessible
5. SSL certificates are valid

---

## 🎯 Quick Deploy Commands

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Frontend (Netlify)
```bash
npm run build
netlify deploy --prod
```

### Backend (PM2)
```bash
cd backend
npm install --production
pm2 start ecosystem.config.js --env production
pm2 save
```

### Backend (Docker)
```bash
cd backend
docker-compose up -d
```

---

**🎉 Your application is now deployment-ready!**

Choose your preferred platform and follow the specific instructions above.

