const jwt = require('jsonwebtoken'); const db = require('../db')
module.exports = async (req,res,next)=>{
  const h = req.headers.authorization; if(!h) return res.status(401).json({ error:'No token' })
  const token = h.split(' ')[1]; try{
    const p = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const r = await db.query('SELECT id,email,is_admin FROM users WHERE id=$1',[p.sub])
    if(!r.rows.length) return res.status(401).json({ error:'Invalid' })
    req.user = r.rows[0]; next()
  }catch(e){ return res.status(401).json({ error:'Invalid' }) }
}
