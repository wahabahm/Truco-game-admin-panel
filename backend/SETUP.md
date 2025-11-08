# Backend Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Make sure MongoDB is running:**
   - Local MongoDB: Should be running on `localhost:27017`
   - MongoDB Atlas: Use connection string in `.env`

3. **Configure environment:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your database credentials.

4. **Start the server:**
   ```bash
   npm run dev
   ```

The server will automatically:
- Connect to the database
- Create all necessary tables
- Create default admin user (admin@truco.com / admin123)

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@truco.com","password":"admin123"}'
```

### Get Users (with token)
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend Connection

Update your frontend `.env` or `vite.config.ts`:
```env
VITE_API_URL = https://truco-game-admin-panel-production.up.railway.app/api
```

Or in `vite.config.ts`:
```js
define: {
  'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3000/api')
}
```

## Troubleshooting

### Database Connection Error
- Check MongoDB is running (or MongoDB Atlas connection)
- Verify `MONGODB_URI` in `.env`
- Ensure MongoDB service is started: `mongod` or check MongoDB Atlas connection

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 3000

### CORS Errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL

