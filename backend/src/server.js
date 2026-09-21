import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config/env.js'
import portfolioRoutes from './routes/portfolio.routes.js'
import profileRoutes from './routes/profile.routes.js'
import backupRoutes from './routes/backup.routes.js'
import marketRoutes from './routes/market.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({
  origin: '*', // Allow connections from frontend, electron desktop, and mobile
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Portfolio CRM Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API Routes
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/backup', backupRoutes)
app.use('/api/market', marketRoutes)

// 404 Handler for unrecognized endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' })
})

// Global Error Handler
app.use(errorHandler)

// Start Server
const server = app.listen(config.port, () => {
  console.log(`=========================================`)
  console.log(` Portfolio CRM Backend REST API Running  `)
  console.log(` Port: ${config.port}                     `)
  console.log(` Health: http://localhost:${config.port}/api/health `)
  console.log(` Environment: ${config.nodeEnv}         `)
  console.log(`=========================================`)
})

export default app
