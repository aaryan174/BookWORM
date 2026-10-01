import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './env.config.js';

// Avoid querySrv ECONNREFUSED on Windows / router DNS resolvers with MongoDB Atlas SRV URIs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('[Database] Failed to override DNS servers:', e.message);
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] Connected to MongoDB host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] Mongoose disconnected from MongoDB');
});
