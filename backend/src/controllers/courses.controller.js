import slugify from 'slugify';
import Course from '../models/Course.js';

// GET /courses?q=react
export const list = async (req, res, next) => {
  try {
    const q = req.query.q;
    const filter = q ? { title: new RegExp(q, 'i') } : {};
    const items = await Course.find(filter)
      .select('title slug description category level ratingAvg ratingCount isPublished')
      .limit(100);
    res.json(items);
  } catch (e) { next(e); }
};

// GET /courses/:slug
export const getOne = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name');
    if (!course) return res.status(404).json({ message: 'Not found' });
    res.json(course);
  } catch (e) { next(e); }
};

// POST /courses  (faculty/admin)
export const create = async (req, res, next) => {
  try {
    const { title, description, category, level } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const course = await Course.create({
      title,
      description,
      category,
      level,
      createdBy: req.user.id,
      slug: slugify(title, { lower: true, strict: true })
    });

    res.status(201).json(course);
  } catch (e) { next(e); }
};

// PATCH /courses/:slug  (faculty owner or admin)
export const update = async (req, res, next) => {
  try {
    const { title, description, category, level, isPublished } = req.body;

    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) return res.status(404).json({ message: 'Not found' });

    // Ownership or admin check
    const isOwner = course.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

    if (title) {
      course.title = title;
      course.slug = slugify(title, { lower: true, strict: true });
    }
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (level !== undefined) course.level = level;
    if (isPublished !== undefined) course.isPublished = isPublished;

    await course.save();
    res.json(course);
  } catch (e) { next(e); }
};

// DELETE /courses/:id  (faculty owner or admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.json({ message: 'Course deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting course', error: err.message })
  }
}



// GET /courses/mine  (faculty/admin)
export const listMine = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin'
    const filter = isAdmin ? {} : { createdBy: req.user.id }

    const items = await Course.find(filter)
      .select('title slug description category level ratingAvg ratingCount isPublished')
      .limit(200)
      .sort({ createdAt: -1 })

    res.json(items)
  } catch (e) { next(e) }
};
