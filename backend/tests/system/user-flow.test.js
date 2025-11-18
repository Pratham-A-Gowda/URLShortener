const request = require('supertest')
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Mock the database module
jest.mock('../../db', () => ({
  query: jest.fn()
}))

const db = require('../../db')
const authRouter = require('../../routes/auth')
const apiRouter = require('../../routes/api')

describe('System Tests: Complete User Workflows', () => {
  let app
  let userId
  let token

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/auth', authRouter)
    app.use('/api', apiRouter)
    
    userId = 1
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
    token = jwt.sign({ sub: userId, is_admin: false }, JWT_SECRET, { expiresIn: '7d' })
    
    jest.clearAllMocks()
  })

  test('complete user journey: register, login, create link, view analytics, delete link', async () => {
    // Step 1: Register a user
    const registerPayload = {
      email: 'journeyuser@example.com',
      password: 'Password@123'
    }

    db.query.mockResolvedValueOnce({ rows: [] }) // no existing user
    db.query.mockResolvedValueOnce({
      rows: [{ id: userId, email: registerPayload.email, is_admin: false }]
    })

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(registerPayload)

    expect(registerRes.status).toBe(200)
    expect(registerRes.body).toHaveProperty('token')

    // Step 2: Create a shortened URL
    const shortenPayload = {
      longUrl: 'https://www.example.com/article/2024/very-long-path',
      alias: 'myarticle'
    }

    db.query.mockResolvedValueOnce({ rows: [] }) // no alias conflict
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        alias: 'myarticle',
        long_url: shortenPayload.longUrl,
        has_qr: false,
        created_at: new Date()
      }]
    })

    const shortenRes = await request(app)
      .post('/api/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send(shortenPayload)

    expect(shortenRes.status).toBe(200)
    expect(shortenRes.body.link.alias).toBe('myarticle')

    // Step 3: Get all links
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        alias: 'myarticle',
        long_url: shortenPayload.longUrl,
        has_qr: false,
        created_at: new Date()
      }]
    })
    db.query.mockResolvedValueOnce({ rows: [{ count: '10' }] })

    const linksRes = await request(app)
      .get('/api/links')
      .set('Authorization', `Bearer ${token}`)

    expect(linksRes.status).toBe(200)
    expect(linksRes.body.links).toHaveLength(1)
    expect(linksRes.body.links[0].clicks).toBe(10)

    // Step 4: Get analytics for a link
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, alias: 'myarticle' }] })
    db.query.mockResolvedValueOnce({
      rows: [
        { ts: new Date(), referrer: 'google.com', ua: 'Mozilla', ip: '127.0.0.1' },
        { ts: new Date(), referrer: 'twitter.com', ua: 'Mozilla', ip: '192.168.1.1' }
      ]
    })

    const analyticsRes = await request(app)
      .get('/api/links/1/analytics')
      .set('Authorization', `Bearer ${token}`)

    expect(analyticsRes.status).toBe(200)
    expect(analyticsRes.body.clicks).toHaveLength(2)

    // Step 5: Delete the link
    db.query.mockResolvedValueOnce({ rows: [{ alias: 'myarticle' }] })
    db.query.mockResolvedValueOnce({ rows: [] })

    const deleteRes = await request(app)
      .delete('/api/links/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ alias: 'myarticle' })

    expect(deleteRes.status).toBe(200)
    expect(deleteRes.body.success).toBe(true)
  })

  test('error handling: attempt to access link that does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .get('/api/links/999/analytics')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })
})
