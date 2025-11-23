# 🎮 Truco Admin Panel

A comprehensive, full-stack admin panel for managing Truco card game tournaments, matches, players, transactions, and real-time game monitoring. Built with modern web technologies and best practices.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0-green)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Milestone Status](#-milestone-status)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Project](#-running-the-project)
- [Testing Guide](#-testing-guide)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Development](#-development)
- [Recent Updates](#-recent-updates)
- [License](#-license)

## 🎯 Overview

The Truco Admin Panel is a production-ready administration system designed to manage all aspects of the Truco card game platform. It provides comprehensive tools for managing players, tournaments, matches, transactions, and game economy with a modern, intuitive interface.

### Key Highlights

- ✅ **Complete Milestone 1 & 2 Implementation** - All admin panel features fully functional
- ✅ **Robust Validation** - Client and server-side validation for all inputs
- ✅ **Secure Authentication** - JWT-based authentication with role-based access control
- ✅ **Real-time Updates** - Live data synchronization across all modules
- ✅ **Export Functionality** - CSV/JSON export for tournaments, matches, and transactions
- ✅ **Professional UI** - Modern, responsive design with shadcn/ui components
- ✅ **Type Safety** - Full TypeScript implementation for reliability

## ✨ Features

### 🎮 User Management
- **Player Management**: View, search, and manage player accounts
- **User Registration**: Register new players directly from admin panel
- **User Statistics**: Track player statistics (wins, losses, coins, activity)
- **Status Management**: Activate/suspend user accounts
- **Coin Management**: Add or remove coins from user accounts with transaction logging
- **Search & Filter**: Advanced search by name, email, or ID

### 🏆 Tournament Management
- **Create Tournaments**: Set up 4 or 8-player tournaments with custom entry fees
- **Bracket Generation**: Automatic bracket generation when tournament fills
- **Tournament Tracking**: Monitor tournament progress and results in real-time
- **Match Result Recording**: Record match results and automatically progress rounds
- **Prize Distribution**: Automatic 80% prize distribution to champion
- **Tournament Cancellation**: Cancel tournaments with automatic participant refunds
- **Export**: Export tournament data as CSV or JSON
- **Status Filtering**: Filter by registration, active, completed, or cancelled

### ⚔️ Match Management
- **Match Creation**: Create 1v1 matches with custom entry costs and prizes
- **Match Monitoring**: Track match status and results
- **Result Recording**: Record match winners with automatic prize distribution
- **Match History**: View complete match history with statistics
- **Auto-join**: Quick join functionality for available matches
- **Export**: Export match data as CSV or JSON
- **Statistics Dashboard**: View match statistics and economy metrics

### 💰 Transaction Management
- **Transaction Logging**: Track all coin transactions automatically
- **Transaction History**: View complete transaction records with filters
- **Advanced Filtering**: Filter by type, date range, amount range
- **Transaction Analytics**: Analyze transaction patterns and trends
- **Export**: Export transaction data as CSV or JSON
- **Economy Monitoring**: Track total income, expenses, and net economy

### 📊 Dashboard & Analytics
- **Dashboard Overview**: Comprehensive dashboard with key platform metrics
- **Real-time Statistics**: Live updates of users, coins, and economy data
- **Economy Breakdown**: Detailed coin usage statistics
- **Visual Cards**: Beautiful stat cards with icons and animations
- **Platform Health**: Monitor overall platform status

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control (Admin/Player)
- **Password Hashing**: Secure password storage with bcrypt
- **Input Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error handling and user feedback
- **Session Management**: Secure session handling

## 🎯 Milestone Status

### ✅ Milestone 1: Game Core + Admin Foundation (COMPLETE)

**Admin Panel Features:**
- ✅ Secure administrator login
- ✅ Registered user view with search
- ✅ Manual coin allocation system (add/remove)
- ✅ Basic player statistics (wins, losses, coins)

### ✅ Milestone 2: Tournament Engine (COMPLETE)

**Admin Panel Features:**
- ✅ Create tournaments manually (name, date, number of players)
- ✅ Configure entry fees per tournament
- ✅ View and manage match history
- ✅ View and manage tournament history
- ✅ Record tournament match results
- ✅ Tournament bracket visualization
- ✅ Automatic prize distribution (80% to champion)

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5.4** - Fast build tool and dev server
- **React Router 6.30** - Client-side routing
- **TanStack Query 5.83** - Data fetching and caching
- **shadcn/ui** - Beautiful UI component library
- **Radix UI** - Accessible component primitives
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Hook Form 7.61** - Form handling
- **Zod 3.25** - Schema validation
- **Sonner 1.7** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js 4.18** - Web framework
- **MongoDB 5.0+** - NoSQL database
- **Mongoose 8.0** - MongoDB object modeling
- **JWT 9.0** - JSON Web Tokens for authentication
- **bcryptjs 2.4** - Password hashing
- **Helmet 7.1** - Security headers
- **CORS 2.8** - Cross-origin resource sharing
- **Swagger** - API documentation
- **Morgan 1.10** - HTTP request logger
- **Express Validator 7.0** - Input validation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
- **Git** - Version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd truco-admin-panel
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Set Up Environment Variables

#### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

#### Backend Configuration

Copy the example environment file:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (MongoDB)
MONGODB_URI=mongodb://localhost:27017/truco_game
# Alternative format: mongodb://username:password@host:port/database
# For MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/truco_game

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:8080
```

### 5. Set Up MongoDB

#### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
3. MongoDB will run on `mongodb://localhost:27017`

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

## ⚙️ Configuration

### Database Setup

The application will automatically create all necessary collections when you first run it. No manual database setup is required.

### JWT Secret

**Important**: Change the `JWT_SECRET` in production to a strong, random string. You can generate one using:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Default Admin Account

The system comes with a default admin account:
- **Email**: `admin@truco.com`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials in production!

## 🏃 Running the Project

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:3000`

#### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:8080` (or the port shown in terminal)

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build:prod
```

#### Start Backend in Production

```bash
cd backend
npm start
```

#### Preview Production Build

```bash
cd frontend
npm run preview
```

## 🧪 Testing Guide

### Quick Test Checklist

1. **Login**
   - Navigate to `http://localhost:8080`
   - Login with: `admin@truco.com` / `admin123`
   - ✅ Should redirect to dashboard

2. **User Management**
   - Go to Users page
   - ✅ View all users
   - ✅ Search users by name/email
   - ✅ Add coins to a user (test integer validation)
   - ✅ Remove coins from a user
   - ✅ Register new player
   - ✅ Suspend/Activate user

3. **Tournament Management**
   - Go to Tournaments page
   - ✅ Create 4-player tournament
   - ✅ Create 8-player tournament
   - ✅ View tournament details
   - ✅ Record tournament match results
   - ✅ Cancel tournament (should refund participants)
   - ✅ Export tournaments (CSV/JSON)

4. **Match Management**
   - Go to Matches page
   - ✅ Create a match
   - ✅ View match statistics
   - ✅ Record match result
   - ✅ Filter by status
   - ✅ Export matches (CSV/JSON)

5. **Transactions**
   - Go to Transactions page
   - ✅ View all transactions
   - ✅ Filter by type, date, amount
   - ✅ Export transactions (CSV/JSON)

6. **Dashboard**
   - ✅ View platform statistics
   - ✅ Check economy breakdown
   - ✅ Verify all metrics are accurate

### Input Validation Tests

- ✅ Try entering decimal coin amounts → Should be rejected
- ✅ Try entering negative numbers → Should be rejected
- ✅ Try submitting empty forms → Should show validation errors
- ✅ Try invalid dates → Should be rejected

## 📁 Project Structure

```
truco-admin-panel/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── database.js # MongoDB connection
│   │   │   └── swagger.js  # API documentation config
│   │   ├── middleware/     # Express middleware
│   │   │   └── auth.middleware.js
│   │   ├── models/         # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Match.js
│   │   │   ├── Tournament.js
│   │   │   └── Transaction.js
│   │   ├── routes/         # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── match.routes.js
│   │   │   ├── tournament.routes.js
│   │   │   ├── transaction.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── utils/          # Utility functions
│   │   │   ├── env.js
│   │   │   ├── logger.js
│   │   │   └── bracketGenerator.js
│   │   └── server.js       # Express server entry point
│   ├── env.example         # Environment variables example
│   └── package.json
├── frontend/               # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── dashboard/ # Dashboard components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── context/       # React context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Matches.tsx
│   │   │   ├── Tournaments.tsx
│   │   │   └── Transactions.tsx
│   │   ├── services/      # API service functions
│   │   │   ├── apiService.ts
│   │   │   └── authService.ts
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── main.tsx       # Application entry point
│   ├── public/            # Static assets
│   ├── package.json
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   └── tailwind.config.ts # Tailwind CSS configuration
└── README.md              # Project documentation
```

## 📚 API Documentation

### Swagger UI

Once the backend server is running, you can access the API documentation at:

```
http://localhost:3000/api-docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin/Player login
- `POST /api/auth/register` - Player registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

#### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/stats` - Get user statistics (admin only)
- `PATCH /api/users/:id/status` - Update user status (admin only)
- `PATCH /api/users/:id/coins` - Add/Remove coins (admin only)

#### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Create match (admin only)
- `POST /api/matches/auto-join` - Auto-join available match
- `POST /api/matches/:id/join` - Join specific match
- `POST /api/matches/:id/result` - Record match result (admin only)
- `GET /api/matches/export` - Export matches (admin only)

#### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create tournament (admin only)
- `POST /api/tournaments/:id/join` - Join tournament
- `POST /api/tournaments/:id/record-match` - Record tournament match (admin only)
- `POST /api/tournaments/:id/cancel` - Cancel tournament (admin only)
- `GET /api/tournaments/export` - Export tournaments (admin only)

#### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/export` - Export transactions (admin only)

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Authentication

### Authentication Flow

1. User logs in with email and password
2. Server validates credentials
3. Server returns JWT token
4. Client stores token in localStorage
5. Client includes token in Authorization header for protected routes
6. Server validates token on each request

### Protected Routes

All routes except `/api/auth/login` and `/api/auth/register` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access

- **Admin**: Full access to all features
- **Player**: Limited access (can join matches/tournaments)

## 💻 Development

### Available Scripts

#### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run build:prod   # Build in production mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
cd backend
npm run dev          # Start development server with nodemon (auto-restart)
npm start            # Start production server
```

### Code Style

- ESLint is configured for code linting
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic

## 🆕 Recent Updates

### Version 2.0.0 - Bug Fixes & Improvements

#### Fixed Issues
- ✅ Fixed coin amount parsing (now uses integers only)
- ✅ Fixed API response structure mismatch
- ✅ Added comprehensive input validation
- ✅ Improved error handling across all pages
- ✅ Added validation for match result recording
- ✅ Enhanced form validation with user-friendly messages

#### Improvements
- ✅ Added integer-only validation for all coin inputs
- ✅ Improved date validation
- ✅ Enhanced error messages
- ✅ Better user feedback for all operations
- ✅ Added input constraints (step="1" for number inputs)
- ✅ Improved API response normalization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Write clear, readable code
- Follow existing code style
- Add comments for complex logic
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For support, please contact the development team or create an issue in the repository.

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF
- [ ] Mobile responsive improvements
- [ ] Multi-language support
- [ ] Advanced tournament features
- [ ] Player ranking system
- [ ] Enhanced tournament brackets visualization

---

**Built with ❤️ for Truco Game Management**

*Last Updated: December 2024*
