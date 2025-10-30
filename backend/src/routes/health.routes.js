import { Router } from 'express'
const router = Router()

// Simple health-check endpoint for Cypress or uptime checks
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    })
})

export default router
