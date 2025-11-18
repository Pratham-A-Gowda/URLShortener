const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

// Mock the database module
jest.mock('../../db', () => ({
  query: jest.fn()
}))

const db = require('../../db')
const apiRouter = require('../../routes/api')

describe('Integration Tests: API Routes', () => {
  let app
  let token

  beforeEach(() => {
    app = express()
    app.use(express.json())
    
    // Create a test JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
    token = jwt.sign({ sub: 1, is_admin: false }, JWT_SECRET, { expiresIn: '7d' })
    
    app.use('/api', apiRouter)
    jest.clearAllMocks()
  })

  describe('POST /api/shorten', () => {
    test('should create a shortened URL with default alias', async () => {
      const payload = {
        longUrl: 'https://example.com/very/long/url'
      }

      // Mock no alias conflict
      db.query.mockResolvedValueOnce({ rows: [] })
      // Mock link creation
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          alias: 'abc12345',
          long_url: payload.longUrl,
          has_qr: false,
          created_at: new Date()
        }]
      })

      const res = await request(app)
        .post('/api/shorten')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('link')
      expect(res.body.link).toHaveProperty('alias')
    })

    test('should create a shortened URL with custom alias', async () => {
      const payload = {
        longUrl: 'https://example.com/path',
        alias: 'mylink'
      }

      // Mock no alias conflict
      db.query.mockResolvedValueOnce({ rows: [] })
      // Mock link creation
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          alias: 'mylink',
          long_url: payload.longUrl,
          has_qr: false,
          created_at: new Date()
        }]
      })

      const res = await request(app)
        .post('/api/shorten')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)

      expect(res.status).toBe(200)
      expect(res.body.link.alias).toBe('mylink')
    })

    test('should reject URL without authorization', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ longUrl: 'https://example.com' })

      expect(res.status).toBe(401)
    })

    test('should reject invalid URL', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .set('Authorization', `Bearer ${token}`)
        .send({ longUrl: 'not-a-url' })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/links', () => {
    test('should retrieve user links with click counts', async () => {
      // Mock links query
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, alias: 'link1', long_url: 'https://example.com', has_qr: false, created_at: new Date() },
          { id: 2, alias: 'link2', long_url: 'https://example2.com', has_qr: true, created_at: new Date() }
        ]
      })
      
      // Mock click counts for each link
      db.query.mockResolvedValueOnce({ rows: [{ count: '5' }] })
      db.query.mockResolvedValueOnce({ rows: [{ count: '3' }] })

      const res = await request(app)
        .get('/api/links')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('links')
      expect(res.body.links).toHaveLength(2)
    })
  })

  describe('DELETE /api/links/:id', () => {
    test('should delete a link with correct alias', async () => {
      // Mock link lookup
      db.query.mockResolvedValueOnce({
        rows: [{ alias: 'mylink' }]
      })
      // Mock deletion
      db.query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .delete('/api/links/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ alias: 'mylink' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    test('should reject deletion with wrong alias', async () => {
      // Mock link lookup
      db.query.mockResolvedValueOnce({
        rows: [{ alias: 'mylink' }]
      })

      const res = await request(app)
        .delete('/api/links/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ alias: 'wrongalias' })

      expect(res.status).toBe(400)
    })
  })
})
