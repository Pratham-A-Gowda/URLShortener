/*
  Run: node seed_admin.js
  This will create an admin user using environment variables SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.
*/
require('dotenv').config()
const bcrypt = require('bcrypt')
const db = require('./db')

async function run(){
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123!'
  const hash = await bcrypt.hash(password,10)
  try{
    const exists = await db.query('SELECT id FROM users WHERE email=$1',[email])
    if(exists.rows.length){ console.log('Admin exists'); process.exit(0) }
    await db.query('INSERT INTO users (email,password_hash,is_admin) VALUES ($1,$2,$3)',[email,hash,true])
    console.log('Admin created:', email)
    process.exit(0)
  }catch(e){ console.error(e); process.exit(1) }
}
run()
