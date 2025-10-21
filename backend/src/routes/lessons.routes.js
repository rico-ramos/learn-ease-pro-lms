import { Router } from 'express'
import { listByCourseSlug, createForCourse, updateOne, removeOne } from '../controllers/lessons.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const r = Router()

// Learners (and above) can list lessons for a course
r.get('/by-course/:slug', requireAuth, listByCourseSlug)

// Faculty/Admin CRUD
r.post('/:slug', requireAuth, requireRole('faculty', 'admin'), createForCourse)
r.patch('/:id', requireAuth, requireRole('faculty', 'admin'), updateOne)
r.delete('/:id', requireAuth, requireRole('faculty', 'admin'), removeOne)

export default r
