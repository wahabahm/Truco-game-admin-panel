import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB } from './config/database.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';
import { validateEnv, getEnvConfig } from './utils/env.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import matchRoutes from './routes/match.routes.js';
import tournamentRoutes from './routes/tournament.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import alertRoutes from './routes/alert.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Get current directory (ES module way)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env file
dotenv.config({ path: join(__dirname, '../.env') });

// Validate environment variables
validateEnv();
const envConfig = getEnvConfig();

const app = express();
const PORT = envConfig.port;

// CORS configuration - allow multiple origins based on environment
const getAllowedOrigins = () => {
  const origins = new Set();
  
  // Always allow the configured frontend URL from environment variable
  if (envConfig.frontendUrl) {
    origins.add(envConfig.frontendUrl);
  }
  
  // Allow multiple frontend URLs (comma-separated) from environment variable
  if (process.env.FRONTEND_URLS) {
    process.env.FRONTEND_URLS.split(',').forEach(url => {
      origins.add(url.trim());
    });
  }
  
  // In development, allow localhost with common ports
  if (envConfig.nodeEnv === 'development') {
    origins.add('http://localhost:8080');
    origins.add('http://localhost:5173');
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:8080');
    origins.add('http://127.0.0.1:5173');
    origins.add('http://127.0.0.1:3000');
  }
  
  return Array.from(origins);
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for Swagger UI
}));
// CORS configuration with proper preflight handling
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin only in development (for tools like Postman)
    // In production, reject requests without origin for security
    if (!origin) {
      if (envConfig.nodeEnv === 'development') {
        return callback(null, true);
      } else {
        logger.warn('CORS blocked: Request with no origin in production');
        return callback(new Error('Not allowed by CORS'));
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log blocked origin with allowed origins for debugging
      logger.warn(`CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests for all routes (preflight)
app.options('*', cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Truco Admin API is running' });
});

// API root endpoint - provides API information
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Truco Admin API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      matches: '/api/matches',
      tournaments: '/api/tournaments',
      transactions: '/api/transactions',
      dashboard: '/api/dashboard',
      alerts: '/api/alerts',
      admin: '/api/admin',
      docs: '/api-docs',
      health: '/health'
    },
    documentation: '/api-docs'
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Truco Admin API Documentation',
  swaggerOptions: {
    persistAuthorization: true // Keep auth token after page refresh
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error middleware:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(envConfig.nodeEnv === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const HOST = process.env.HOST || '0.0.0.0';
    app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on ${HOST}:${PORT}`);
      logger.info(`📊 Environment: ${envConfig.nodeEnv}`);
      logger.info(`🌐 Allowed CORS origins: ${getAllowedOrigins().join(', ')}`);
      logger.info(`📚 Swagger API Docs: http://${HOST}:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


