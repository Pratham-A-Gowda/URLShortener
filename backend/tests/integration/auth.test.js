const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../db', () => ({
  query: jest.fn()
}));

const db = require('../../db');
const authRouter = require('../../routes/auth');

describe('Integration Tests: Authentication Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user with valid credentials', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'Test@123456'
      };

      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: newUser.email,
          is_admin: false
        }]
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(newUser.email);
    });

    test('should reject registration with existing email', async () => {
      const newUser = {
        email: 'existing@example.com',
        password: 'Test@123456'
      };

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should reject registration with missing email or password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user with correct credentials', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'Test@123456'
      };

      const hashedPassword = await bcrypt.hash(credentials.password, 10);

      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: credentials.email,
          password_hash: hashedPassword,
          is_admin: false
        }]
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    test('should reject login with invalid email', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'Test@123456'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
