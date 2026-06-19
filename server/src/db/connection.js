import mongoose from 'mongoose';
import { config } from '../config/environment.js';

let isConnected = false;

/**
 * Connect to MongoDB
 * Implements connection pooling and error handling
 */
export async function connectDB() {
  if (isConnected) {
    console.log('✓ Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    isConnected = true;
    console.log('✓ MongoDB connected successfully');
    
    // Setup connection event listeners
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err);
    });

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    if (config.NODE_ENV === 'production') {
      throw error;
    }
    console.warn('⚠️  Continuing without database...');
    return null;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✓ MongoDB disconnected');
  }
}

export default { connectDB, disconnectDB };
