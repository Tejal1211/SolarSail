import request from 'supertest';
import app from '../src/server.js';
import User from '../src/models/User.js';
import { connectDB, disconnectDB } from '../src/db/connection.js';

describe('Authentication API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDB();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Test123456',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not create user with invalid email', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'invalid-email',
        name: 'Test User',
        password: 'Test123456',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should not create user with weak password', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'weak@example.com',
        name: 'Test User',
        password: 'weak',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must be');
    });

    it('should not create duplicate user', async () => {
      await request(app).post('/api/auth/signup').send({
        email: 'duplicate@example.com',
        name: 'Test User',
        password: 'Test123456',
      });

      const res = await request(app).post('/api/auth/signup').send({
        email: 'duplicate@example.com',
        name: 'Test User',
        password: 'Test123456',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send({
        email: 'login@example.com',
        name: 'Test User',
        password: 'Test123456',
      });
    });

    it('should login user with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Test123456',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPassword123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should not login non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Test123456',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'profile@example.com',
        name: 'Profile User',
        password: 'Test123456',
      });
      token = res.body.token;
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('profile@example.com');
    });

    it('should not access without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });
});
