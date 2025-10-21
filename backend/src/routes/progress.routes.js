import { Router } from 'express'
import { getByCourseSlug, mark } from '../controllers/progress.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const r = Router()

// Learner’s progress for all lessons in a course
r.get('/by-course/:slug', requireAuth, getByCourseSlug)

// Mark/update progress for a lesson
r.post('/mark', requireAuth, requireRole('learner'), mark)

export default r
