const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')
const router = express.Router()
const JWT = process.env.JWT_SECRET || 'secret'

router.post('/register', async (req,res)=>{
  const { email, password } = req.body
  if(!email || !password) return res.status(400).json({ error:'Missing' })
  const e = await db.query('SELECT id FROM users WHERE email=$1',[email])
  if(e.rows.length) return res.status(400).json({ error:'Email exists' })
  const hash = await bcrypt.hash(password,10)
  const r = await db.query('INSERT INTO users (email,password_hash,is_admin) VALUES ($1,$2,$3) RETURNING id,email,is_admin',[email,hash,false])
  const user = r.rows[0]
  const token = jwt.sign({ sub: user.id, is_admin: user.is_admin }, JWT, { expiresIn: '7d' })
  return res.json({ token, user })
})

router.post('/login', async (req,res)=>{
  const { email, password } = req.body
  const r = await db.query('SELECT id,email,password_hash,is_admin FROM users WHERE email=$1',[email])
  if(!r.rows.length) return res.status(400).json({ error:'Invalid' })
  const user = r.rows[0]
  const ok = await bcrypt.compare(password, user.password_hash)
  if(!ok) return res.status(400).json({ error:'Invalid' })
  const token = jwt.sign({ sub: user.id, is_admin: user.is_admin }, JWT, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, email: user.email, is_admin: user.is_admin } })
})

module.exports = router
