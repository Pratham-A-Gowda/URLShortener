const express = require('express'); const router = express.Router(); const db = require('../db')
router.get('/:alias', async (req,res)=>{
  const alias = req.params.alias
  const r = await db.query('SELECT id,long_url FROM links WHERE alias=$1',[alias])
  if(!r.rows.length) return res.status(404).send('Not found')
  const link = r.rows[0]
  const ua = req.get('User-Agent')||null
  const ref = req.get('Referer')||null
  const ip = req.ip || req.connection.remoteAddress || null
  await db.query('INSERT INTO clicks (link_id,referrer,ua,ip) VALUES ($1,$2,$3,$4)',[link.id,ref,ua,ip])
  return res.redirect(link.long_url)
})
module.exports = router
