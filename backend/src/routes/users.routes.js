import { Router } from 'express'
import { list, getOne } from '../controllers/users.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const r = Router()

r.get('/', requireAuth, requireRole('admin'), list)
r.get('/:id', requireAuth, requireRole('admin'), getOne)

export default r
