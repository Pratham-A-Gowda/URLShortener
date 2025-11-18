require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const cors = require('cors')

const authRouter = require('./routes/auth')
const apiRouter = require('./routes/api')
const redirectRouter = require('./routes/redirect')
const adminRouter = require('./routes/admin')

const app = express()
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))
app.use(cors({ origin: true }))

const limiter = rateLimit({ windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS||60000), max: parseInt(process.env.RATE_LIMIT_MAX||200) })
app.use(limiter)

app.use('/api/auth', authRouter)
app.use('/api', apiRouter)
app.use('/r', redirectRouter)
app.use('/api/admin', adminRouter)

app.get('/', (req,res)=> res.json({ ok:true }))

const PORT = process.env.PORT||4000
app.listen(PORT, ()=> console.log('Server running on', PORT))
