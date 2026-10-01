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

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Logger middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Payment webhook uses raw body, so mount payment routes before standard json parser
app.use('/api/v1/payments', paymentRoutes);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
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
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);

// Unhandled route handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find endpoint ${req.originalUrl} on this server`, 404));
});

// Global Centralized Error Handler
app.use(globalErrorHandler);

export default app;
