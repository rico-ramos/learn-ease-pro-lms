import { Router } from 'express';
import { requestAccess, approve, mine, listPending } from '../controllers/enrollments.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();

// learner requests access
r.post('/request', requireAuth, requireRole('learner'), requestAccess);

// current user's enrollments
r.get('/mine', requireAuth, mine);

// list pending (admin sees all; faculty sees their courses' requests)
r.get('/pending', requireAuth, requireRole('admin', 'faculty'), listPending);

// admin or faculty can approve
r.patch('/:id/approve', requireAuth, requireRole('admin', 'faculty'), approve);


export default r;
