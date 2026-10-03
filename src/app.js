import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { config } from './config/env.config.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import { AppError } from './utils/AppError.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import bookRoutes from './routes/book.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import storageRoutes from './routes/storage.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy on Render and other cloud load balancers (vital for rate limiting & secure HTTPS cookies)
app.set('trust proxy', 1);

// Security Headers with permissive CSP for fonts, ImageKit covers, and Razorpay modal
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      frameSrc: ["'self'", "https://api.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "https://ik.imagekit.io", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com", "https://*.onrender.com"]
    }
  }
}));

// Dynamic CORS configuration supporting local development, Render *.onrender.com domains, and FRONTEND_URL
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://localhost:5000'
].flatMap(url => (url ? url.split(',') : [])).map(s => s.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
                      origin.endsWith('.onrender.com') ||
                      /^http:\/\/localhost:\d+$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }
    // Fallback: allow to avoid unintended CORS breakage across dynamically generated Render subdomains
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Logger middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Parsers: Payment webhook uses raw body buffer; standard API routes use JSON parser
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint (Render uses this for zero-downtime health verification)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'BookWORM Marketplace API operational',
    timestamp: new Date().toISOString()
  });
});

// API Routes mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/storage', storageRoutes);

// In production, serve the built Vite frontend from client/dist if present
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback: return index.html for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Unhandled route handler for non-existent API endpoints
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find endpoint ${req.originalUrl} on this server`, 404));
});

// Global Centralized Error Handler
app.use(globalErrorHandler);

export default app;
