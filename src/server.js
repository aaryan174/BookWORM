import app from './app.js';
import { connectDB } from './config/db.config.js';
import { config } from './config/env.config.js';

const startServer = async () => {
  await connectDB();

  const HOST = '0.0.0.0';
  const server = app.listen(config.port, HOST, () => {
    console.log(`=======================================================`);
    console.log(`🚀 BookWORM Marketplace Server running in [${config.env}] mode`);
    console.log(`📡 Listening on http://${HOST}:${config.port}`);
    console.log(`=======================================================`);
  });

  const handleShutdown = (signal) => {
    console.log(`\n[Server] ${signal} signal received. Gracefully shutting down...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
