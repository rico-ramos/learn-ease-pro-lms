import { Router } from 'express';
import { list, getOne, create, update, listMine, deleteCourse } from '../controllers/courses.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();

// Order matters: static before param routes
r.get('/', list);
r.get('/mine', requireAuth, requireRole('faculty', 'admin'), listMine);
r.get('/:slug', getOne);


r.post('/', requireAuth, requireRole('faculty', 'admin'), create);
r.patch('/:slug', requireAuth, requireRole('faculty', 'admin'), update);

r.delete('/:id', requireAuth, requireRole('faculty', 'admin'), deleteCourse)


export default r;
