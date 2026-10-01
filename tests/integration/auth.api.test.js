import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import app from '../../src/app.js';
import { User } from '../../src/models/user.model.js';

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication API Integration Tests', () => {
  it('POST /api/v1/auth/register - should successfully register a new buyer', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Integration Test User',
        email: 'testuser@example.com',
        password: 'Password@123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('_id');
    expect(res.body.data.user.email).toBe('testuser@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/v1/auth/register - should reject duplicate email registration', async () => {
    await User.create({
      name: 'Existing User',
      email: 'testuser@example.com',
      passwordHash: 'Password@123',
      roles: ['buyer']
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Duplicate User',
        email: 'testuser@example.com',
        password: 'Password@123'
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body.success).toBe(false);
  });
});
