import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/truco_game';
    
    await mongoose.connect(mongoURI, {
      // These options are handled automatically in newer versions
    });

    logger.info('✅ MongoDB connected successfully');
    
    // Initialize default admin user
    await initializeDefaultAdmin();
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

const initializeDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@truco.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@truco.com',
        passwordHash: hashedPassword,
        role: 'admin',
        coins: 10000
      });
      logger.info('✅ Default admin user created (admin@truco.com / admin123)');
    }
  } catch (error) {
    logger.error('❌ Error initializing admin user:', error);
  }
};

export default mongoose;
