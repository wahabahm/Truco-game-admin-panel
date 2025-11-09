# 🎮 Truco Admin Panel

A comprehensive, full-stack admin panel for managing Truco card game tournaments, matches, players, transactions, and real-time game monitoring. Built with modern web technologies and best practices.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Development](#-development)
- [Production Deployment](#-production-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### User Management
- **Player Management**: View, search, and manage player accounts
- **User Statistics**: Track player statistics, coins, and activity
- **Status Management**: Activate/deactivate user accounts
- **Coin Management**: Add or remove coins from user accounts

### Tournament Management
- **Create Tournaments**: Set up and configure tournaments
- **Bracket Generation**: Automatic bracket generation for tournaments
- **Tournament Tracking**: Monitor tournament progress and results
- **Tournament Analytics**: View tournament statistics and reports

### Match Management
- **Match Creation**: Create and manage game matches
- **Match Monitoring**: Track match status and results
- **Live Matches**: Real-time monitoring of active matches
- **Match History**: View complete match history and statistics

### Transaction Management
- **Transaction Logging**: Track all coin transactions
- **Transaction History**: View complete transaction records
- **Transaction Analytics**: Analyze transaction patterns and trends

### Real-time Features
- **Live Monitoring**: Real-time game monitoring dashboard
- **Alerts System**: Manage and view system alerts
- **Notifications**: Real-time notifications for important events

### Dashboard & Analytics
- **Dashboard Overview**: Comprehensive dashboard with key metrics
- **Reports**: Generate detailed analytics and reports
- **Visualizations**: Charts and graphs for data visualization
- **Statistics**: Real-time statistics and insights

### Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **Password Hashing**: Secure password storage with bcrypt
- **Session Management**: Secure session handling

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **shadcn/ui** - Beautiful UI component library
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Swagger** - API documentation
- **Morgan** - HTTP request logger
- **Express Validator** - Input validation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
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
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Set Up Environment Variables

#### Frontend Configuration

Create a `.env` file in the root directory (if needed):

```env
VITE_API_URL=http://localhost:3000
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
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/truco_game

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
npm run dev
```

The frontend will run on `http://localhost:8080`

### Production Build

#### Build Frontend

```bash
npm run build
```

#### Start Backend in Production

```bash
cd backend
npm start
```

#### Preview Production Build

```bash
npm run preview
```

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
│   │   │   ├── Transaction.js
│   │   │   └── Alert.js
│   │   ├── routes/         # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── match.routes.js
│   │   │   ├── tournament.routes.js
│   │   │   ├── transaction.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── alert.routes.js
│   │   │   └── admin.routes.js
│   │   ├── utils/          # Utility functions
│   │   │   ├── env.js
│   │   │   ├── logger.js
│   │   │   └── bracketGenerator.js
│   │   └── server.js       # Express server entry point
│   ├── env.example         # Environment variables example
│   └── package.json
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/        # Layout components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...
│   ├── context/           # React context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Matches.tsx
│   │   ├── Tournaments.tsx
│   │   ├── Transactions.tsx
│   │   ├── Live.tsx
│   │   ├── Reports.tsx
│   │   └── Alerts.tsx
│   ├── services/          # API service functions
│   │   ├── apiService.ts
│   │   └── authService.ts
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── package.json
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## 📚 API Documentation

### Swagger UI

Once the backend server is running, you can access the API documentation at:

```
http://localhost:3000/api-docs
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin/Player login
- `POST /api/auth/register` - Player registration
- `GET /api/auth/me` - Get current user

#### Users
- `GET /api/users` - Get all users (with search and pagination)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/status` - Update user status (admin only)
- `PATCH /api/users/:id/coins` - Add/Remove coins (admin only)

#### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create match (admin only)
- `POST /api/matches/:id/join` - Join match
- `POST /api/matches/:id/result` - Record match result (admin only)

#### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `POST /api/tournaments` - Create tournament (admin only)
- `GET /api/tournaments/:id` - Get tournament by ID
- `PATCH /api/tournaments/:id` - Update tournament (admin only)

#### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

#### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert (admin only)
- `PATCH /api/alerts/:id` - Update alert (admin only)

#### Health Check
- `GET /health` - Server health check

## 🔐 Authentication

### Default Admin Credentials

```
Email: admin@truco.com
Password: admin123
```

**⚠️ Important**: Change these credentials in production!

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

## 💻 Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `npm run dev` - Start development server with nodemon (auto-restart)
- `npm start` - Start production server

### Code Style

- ESLint is configured for code linting
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic

## 🚢 Production Deployment

### Frontend Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Serve the `dist` folder using a web server (Nginx, Apache, etc.)

3. Configure the web server to serve the frontend:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/truco-admin-panel/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Backend Deployment

1. Set environment variables:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_strong_secret_key
   FRONTEND_URL=https://your-domain.com
   ```

2. Use a process manager:
   ```bash
   npm install -g pm2
   cd backend
   pm2 start src/server.js --name truco-api
   pm2 save
   pm2 startup
   ```

3. Set up reverse proxy (Nginx):
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
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

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
- [ ] Export reports to PDF/Excel
- [ ] Mobile responsive improvements
- [ ] Multi-language support
- [ ] Advanced tournament features
- [ ] Player ranking system
- [ ] Tournament brackets visualization

---

**Built with ❤️ for Truco Game Management**
