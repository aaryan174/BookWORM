# Local Development & Guidelines — Online Book Marketplace

## 1. Local Prerequisites
* Node.js v18.x or v20.x
* npm v9.x or v10.x
* MongoDB Community Server running locally or MongoDB Atlas URI
* Git

---

## 2. Quickstart Guide

### 2.1 Clone & Setup Environment
```bash
# Copy example environment configuration
cp .env.example .env
```

### 2.2 Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install
```

### 2.3 Run Database Seeds
```bash
# Seed initial categories, canonical books, test users, and seller listings
npm run seed
```

### 2.4 Run Development Servers
```bash
# Start backend in watch mode (Nodemon)
npm run dev

# In a separate terminal, start React client (Vite)
cd client && npm run dev
```

---

## 3. Directory Layout & Architecture Rules

### 3.1 Backend Layout
```text
server/ (or root src/)
├── src/
│   ├── config/          # Environment configuration & DB connection
│   ├── controllers/     # Thin HTTP handlers
│   ├── dao/             # MongoDB query aggregation layer
│   ├── middlewares/     # Express authentication & security middleware
│   ├── models/          # Mongoose schema definitions
│   ├── routes/          # Express route definitions
│   ├── seeds/           # Database seeder scripts
│   ├── services/        # Business logic orchestration
│   ├── utils/           # Shared utility functions
│   ├── validators/      # Payload validation rules
│   ├── app.js           # Express app setup
│   └── server.js        # HTTP server listener
```

### 3.2 Frontend Layout (Strict 4-Layer Architecture)
```text
client/src/
├── app/                 # Main entry, App providers, router
├── components/          # Presentational UI components (Button, Input, Card)
├── features/            # Feature modules (auth, books, cart, checkout, seller, orders)
│   ├── [feature_name]/
│   │   ├── pages/       # Route-level React views
│   │   ├── components/  # Feature-specific UI components
│   │   ├── api/         # Axios API calls
│   │   ├── hooks/       # Orchestrator custom hooks
│   │   └── context/     # Feature context (if shared state required)
├── layouts/             # Navbar, Footer, Page Wrapper
└── utils/               # Formatters, constants
```

---

## 4. Git & Commit Guidelines

Commits must follow the Conventional Commits specification:

```text
feat(auth): implement refresh token rotation
feat(book): add multi-seller listing support
fix(cart): correct subtotal calculation for multiple items
docs(payments): update webhook idempotency flow
test(order): add integration test for stock reservation concurrency
```
