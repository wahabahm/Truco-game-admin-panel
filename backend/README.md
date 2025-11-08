# Truco Admin Panel - Backend API

Backend API server for Truco Admin Panel built with Node.js, Express, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with user registration and login
- **User Management**: Search users, view stats, manage coins, update status
- **Match Management**: Create matches, join matches, record results
- **Transaction Logging**: Track all coin transactions
- **Dashboard Stats**: Real-time statistics for admin panel
- **Security**: Helmet, CORS, input validation, authentication middleware

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=truco_game
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:8080
```

3. Make sure MongoDB is running:
```bash
# MongoDB should be running on localhost:27017
# Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env
```

4. Start the server:
```bash
npm run dev
```

The server will automatically create all necessary tables on first run.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin/Player login
- `POST /api/auth/register` - Player registration
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/status` - Update user status (admin only)
- `PATCH /api/users/:id/coins` - Add/Remove coins (admin only)

### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create match (admin only)
- `POST /api/matches/:id/join` - Join match
- `POST /api/matches/:id/result` - Record match result (admin only)

### Transactions
- `GET /api/transactions` - Get all transactions

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Default Admin Credentials

- **Email**: admin@truco.com
- **Password**: admin123

*(Change this in production!)*

## Database Schema

The server automatically creates these collections (MongoDB):
- `users` - User accounts and stats
- `matches` - Game matches
- `transactions` - Coin transactions

All collections are created automatically when first document is inserted.

## Security

- JWT token authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Helmet for security headers
- CORS protection
- SQL injection protection (parameterized queries)

## Development

```bash
npm run dev  # Start with nodemon (auto-restart)
npm start    # Start production server
```

## Production Deployment

### Railway Deployment

1. **Set Environment Variables in Railway:**
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_production_mongodb_connection_string
   JWT_SECRET=your_strong_secret_key_at_least_32_characters
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://fluffy-naiad-0644a9.netlify.app
   ```

2. **Important Notes:**
   - Set `NODE_ENV=production` - This ensures only your production frontend URL is allowed in CORS
   - Set `FRONTEND_URL` to your Netlify deployment URL (or your production frontend URL)
   - Use a strong `JWT_SECRET` (at least 32 characters)
   - Use production MongoDB connection string (MongoDB Atlas recommended)

3. **CORS Configuration:**
   - In production, only the `FRONTEND_URL` environment variable will be allowed
   - Localhost origins are automatically excluded when `NODE_ENV=production`
   - Requests without origin are blocked in production for security

### General Production Checklist

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (at least 32 characters)
3. Configure proper database credentials (use MongoDB Atlas for production)
4. Set `FRONTEND_URL` to your production frontend URL
5. Set up SSL/TLS (Railway handles this automatically)
6. Configure firewall rules (if needed)
7. Use process manager (Railway handles this automatically)

