import { Router } from 'express';
import { postFeedback, listCourseFeedback } from '../controllers/feedback.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/course/:courseId', listCourseFeedback);
r.post('/course/:courseId', requireAuth, requireRole('learner'), postFeedback);

export default r;
