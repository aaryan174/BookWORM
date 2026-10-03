import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './env.config.js';

// Avoid querySrv ECONNREFUSED on local Windows machines with restrictive ISP DNS resolvers
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    console.warn('[Database] Failed to override DNS servers on Windows:', e.message);
  }
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000 // 10s connection timeout for cloud deployment resilience
    });
    console.log(`[Database] Connected to MongoDB host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] Mongoose disconnected from MongoDB');
});
