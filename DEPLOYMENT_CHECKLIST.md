# ✅ Deployment Checklist

Use this checklist before deploying to production.

## 🔧 Pre-Deployment Setup

### Frontend
- [ ] Create `.env.production` file with `VITE_API_URL`
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Test build locally: `npm run build`
- [ ] Verify build output in `dist/` folder
- [ ] Check that all assets load correctly

### Backend
- [ ] Create `backend/.env` file from `env.example`
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB connection (MongoDB Atlas recommended)
- [ ] Generate strong JWT secret (min 32 characters)
- [ ] Set `FRONTEND_URL` to deployed frontend URL
- [ ] Test server starts: `npm start`
- [ ] Verify health endpoint: `http://localhost:3000/health`

## 🔐 Security Checklist

- [ ] Changed default admin credentials (admin@truco.com / admin123)
- [ ] Strong JWT secret set (32+ characters)
- [ ] MongoDB credentials secure
- [ ] CORS configured for production frontend URL only
- [ ] Environment variables not exposed in code
- [ ] HTTPS/SSL enabled
- [ ] Database has authentication enabled
- [ ] Firewall rules configured (if applicable)

## 🌐 Frontend Deployment

### Platform-Specific
- [ ] **Vercel**: Environment variables set in dashboard
- [ ] **Netlify**: Environment variables set in dashboard
- [ ] **Railway**: Environment variables set in dashboard
- [ ] **Render**: Environment variables set in dashboard
- [ ] **VPS/Server**: Nginx configured, SSL certificate installed

### Verification
- [ ] Frontend loads correctly
- [ ] All routes work (SPA routing)
- [ ] API calls succeed
- [ ] No console errors
- [ ] Assets load correctly
- [ ] SSL certificate valid

## 🔌 Backend Deployment

### Platform-Specific
- [ ] **Railway**: Environment variables set
- [ ] **Render**: Environment variables set
- [ ] **Vercel**: Serverless functions configured (if applicable)
- [ ] **VPS/Server**: PM2 running, Nginx reverse proxy configured
- [ ] **Docker**: Container running, volumes mounted

### Verification
- [ ] Server starts successfully
- [ ] MongoDB connection working
- [ ] Health endpoint responds: `/health`
- [ ] API documentation accessible: `/api-docs`
- [ ] CORS allows frontend requests
- [ ] Authentication working
- [ ] SSL certificate valid

## 🗄️ Database Setup

- [ ] MongoDB Atlas cluster created (or local MongoDB)
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string in backend `.env`
- [ ] Database backup strategy in place
- [ ] Connection tested from backend

## 📊 Monitoring & Logs

- [ ] Logging configured
- [ ] Error tracking set up (optional)
- [ ] Monitoring set up (optional)
- [ ] PM2 monitoring (if using PM2)
- [ ] Health checks configured

## 🧪 Testing

- [ ] Login functionality works
- [ ] API endpoints respond correctly
- [ ] Frontend-backend communication working
- [ ] No CORS errors
- [ ] Authentication working
- [ ] Protected routes work
- [ ] All features tested

## 📝 Documentation

- [ ] API documentation accessible
- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] Team has access to deployment credentials

## 🚀 Post-Deployment

- [ ] Default admin password changed
- [ ] Test all major features
- [ ] Verify production logs
- [ ] Check error rates
- [ ] Monitor performance
- [ ] Set up backups
- [ ] Document deployment process

## 🔄 Rollback Plan

- [ ] Previous version backed up
- [ ] Rollback procedure documented
- [ ] Database backup available
- [ ] Team knows rollback process

---

## 🆘 Troubleshooting

If deployment fails:

1. **Check logs:**
   - Frontend: Browser console, build logs
   - Backend: Server logs, PM2 logs, platform logs

2. **Verify environment variables:**
   - All required variables set
   - Values correct (no typos)
   - Format correct (no extra spaces)

3. **Check connections:**
   - MongoDB connection
   - Frontend to backend
   - CORS configuration

4. **Verify build:**
   - Build completes without errors
   - All dependencies installed
   - Node.js version correct

5. **Check security:**
   - Firewall rules
   - CORS settings
   - SSL certificates

---

**✅ Ready for Production!**

Complete all items above before deploying to production.

