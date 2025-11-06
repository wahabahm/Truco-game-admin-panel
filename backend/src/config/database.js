import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/truco_game';
    
    await mongoose.connect(mongoURI, {
      // These options are handled automatically in newer versions
    });

    console.log('✅ MongoDB connected successfully');
    
    // Initialize default admin user
    await initializeDefaultAdmin();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
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
      console.log('✅ Default admin user created (admin@truco.com / admin123)');
    }
  } catch (error) {
    console.error('❌ Error initializing admin user:', error.message);
  }
};

export default mongoose;
