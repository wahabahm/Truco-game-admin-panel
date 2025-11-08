import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
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

dotenv.config();

// Validate environment variables
validateEnv();
const envConfig = getEnvConfig();

const app = express();
const PORT = envConfig.port;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for Swagger UI
}));
app.use(cors({
  origin: envConfig.frontendUrl,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Truco Admin API is running' });
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
      logger.info(`📚 Swagger API Docs: http://${HOST}:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


