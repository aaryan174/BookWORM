import dotenv from 'dotenv';
dotenv.config();

// Environment configuration for BookWORM Marketplace
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://aryan007lko_db_user:MongoTest12345@cluster0.mtq0rhw.mongodb.net/?authSource=admin',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_min32chars_required_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_min32chars_key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_bookworm_key_12345',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'razorpay_test_secret_67890',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'razorpay_webhook_secret_12345'
  },
  financials: {
    commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.10'),
    taxRate: parseFloat(process.env.DEFAULT_TAX_RATE || '0.05'),
    shippingFee: parseFloat(process.env.DEFAULT_SHIPPING_FEE || '50'),
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '999')
  },
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/bookworm'
  }
};
