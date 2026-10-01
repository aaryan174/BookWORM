# Deployment & Infrastructure Guide — Online Book Marketplace

## 1. Environment Configurations

Maintain a strictly sanitized `.env.example` in the project root. Never commit real credentials to version control.

### Required Environment Variables

```env
# Node Environment
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bookworm?retryWrites=true&w=majority

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_access_key_min32chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min32chars
JWT_REFRESH_EXPIRES_IN=7d

# CORS & Client URL
FRONTEND_URL=https://bookworm.example.com

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# File Storage Provider (ImageKit / Cloudinary / S3)
STORAGE_PROVIDER=imagekit
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/bookworm

# Email Provider (Nodemailer / SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@bookworm.example.com
```

---

## 2. Production Checklist

### Security & Hardening
- [ ] Ensure `NODE_ENV=production` is set.
- [ ] Confirm all auth cookies set `secure: true`, `httpOnly: true`, and `sameSite: strict`.
- [ ] Verify Helmet middleware is active with production Content Security Policy (CSP).
- [ ] Verify rate-limiting on sensitive endpoints (`/auth/login`, `/auth/register`, `/payments/verify`).
- [ ] Ensure MongoDB connection uses TLS/SSL (`retryWrites=true&w=majority`).

### Database Optimization
- [ ] Run Mongoose index verification script (`npm run db:index`) before deployment.
- [ ] Verify MongoDB Atlas IP Access List restrictions.

### Server Process Management (PM2)
```json
{
  "apps": [
    {
      "name": "bookworm-api",
      "script": "src/server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```

### Static Asset Deployment & Storage Provider
- Images uploaded by sellers/admins are passed through `StorageService` to object storage (ImageKit/Cloudinary/S3).
- Frontend assets compiled using Vite (`npm run build`) and served via CDN / Nginx / Vercel.
