import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// POST /enrollments/request  (learner)
// body: { courseId }
export const requestAccess = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const course = await Course.findById(courseId).select('_id');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enr = await Enrollment.create({
      learner: req.user.id,
      course: course._id,
      status: 'requested'
    });

    res.status(201).json(enr);
  } catch (e) {
    // Duplicate key (unique index on learner+course)
    if (e.code === 11000) return res.status(409).json({ message: 'Already requested or enrolled' });
    next(e);
  }
};

// PATCH /enrollments/:id/approve  (admin or faculty)
export const approve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enr = await Enrollment.findById(id);
    if (!enr) return res.status(404).json({ message: 'Not found' });

    enr.status = 'approved';
    enr.approvedBy = req.user.id;
    await enr.save();

    res.json(enr);
  } catch (e) { next(e); }
};

// GET /enrollments/mine (auth)
export const mine = async (req, res, next) => {
  try {
    const items = await Enrollment
      .find({ learner: req.user.id })
      .populate('course', 'title slug');
    res.json(items);
  } catch (e) { next(e); }
};


// GET /enrollments/pending  (admin/faculty)
// - admin: all 'requested' enrollments
// - faculty: only enrollments for courses they created

export const listPending = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    let filter = { status: 'requested' };

    if (!isAdmin) {
      // faculty: find their course IDs
      const myCourses = await Course.find({ createdBy: req.user.id }).select('_id');
      const ids = myCourses.map(c => c._id);
      filter.course = { $in: ids.length ? ids : [new mongoose.Types.ObjectId('000000000000000000000000')] }; // empty guard
    }

    const items = await Enrollment.find(filter)
      .populate('course', 'title slug')
      .populate('learner', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(items);
  } catch (e) { next(e); }
};
