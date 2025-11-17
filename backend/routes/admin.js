const express = require('express'); const router = express.Router(); const db = require('../db')
const jwt = require('jsonwebtoken')

async function ensureAdmin(req,res,next){
  const h = req.headers.authorization; if(!h) return res.status(401).json({ error:'No token' })
  const token = h.split(' ')[1]; try{
    const p = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    if(!p.is_admin) return res.status(403).json({ error:'Forbidden' })
    next()
  }catch(e){ return res.status(401).json({ error:'Invalid' }) }
}

router.get('/users', ensureAdmin, async (req,res)=>{
  const r = await db.query('SELECT id,email,is_admin,created_at FROM users ORDER BY created_at DESC')
  res.json({ users: r.rows })
})

router.post('/users/:id/promote', ensureAdmin, async (req,res)=>{
  const id = req.params.id; await db.query('UPDATE users SET is_admin = true WHERE id=$1',[id]); res.json({ ok:true })
})

router.post('/users/:id/demote', ensureAdmin, async (req,res)=>{
  const id = req.params.id; await db.query('UPDATE users SET is_admin = false WHERE id=$1',[id]); res.json({ ok:true })
})

router.delete('/users/:id', ensureAdmin, async (req,res)=>{
  const id = req.params.id; await db.query('DELETE FROM users WHERE id=$1',[id]); res.json({ ok:true })
})

module.exports = router
