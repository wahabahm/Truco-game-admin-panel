# Production Deployment Checklist

## Environment Variables

Set these in your production environment:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/truco_game?retryWrites=true&w=majority

# JWT - MUST be strong (32+ characters)
JWT_SECRET=your_super_strong_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Set your production frontend URL
FRONTEND_URL=https://your-frontend-domain.com
# OR for multiple origins:
FRONTEND_URLS=https://your-frontend-domain.com,https://unity-client-domain.com
```

## Security Checklist

✅ **Completed:**
- Cookies are secure in production (httpOnly, secure flag)
- Verification tokens never returned in production
- CORS properly configured for production
- Error messages don't expose sensitive data
- Stack traces hidden in production
- Debug logs removed from production code

## Email Service Setup

**Important:** Currently verification emails are not sent automatically. For production:

1. Integrate email service (e.g., SendGrid, AWS SES, Nodemailer)
2. Update `/api/auth/register` endpoint to send verification email
3. Update `/api/auth/resend-verification` endpoint to send email
4. Update `/api/users/register` endpoint to send email

Email template should include:
```
Verification Link: ${FRONTEND_URL}/verify-email?token=${emailVerificationToken}
```

## Unity Client Integration

✅ **Ready for Unity:**
- Cookie-based authentication (access_token, refresh_token, XSRF-TOKEN)
- X-XSRF-TOKEN header validation
- Refresh endpoint: `/api/auth/refresh`
- Error format: `{error: "message"}`
- CORS configured for Unity client

## Pre-Deployment Checks

- [ ] Set `NODE_ENV=production` in environment
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Set production `MONGODB_URI`
- [ ] Set production `FRONTEND_URL` or `FRONTEND_URLS`
- [ ] Configure email service for verification emails
- [ ] Test all endpoints in production mode
- [ ] Verify CORS works with production URLs
- [ ] Check cookies are secure (HTTPS required)
- [ ] Remove any console.log statements
- [ ] Test Unity client integration

## Deployment Commands

```bash
# Backend
cd backend
npm install --production
NODE_ENV=production npm start

# Frontend
cd frontend
npm install
npm run build:prod
```

## Notes

- In production, verification tokens are NEVER returned in API responses
- Cookies require HTTPS (secure flag is enabled)
- CORS is strict (only allowed origins)
- Error messages don't expose internal details
- Stack traces are hidden in production

