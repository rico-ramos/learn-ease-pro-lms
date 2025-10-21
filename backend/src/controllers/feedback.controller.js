import Feedback from '../models/Feedback.js';

// POST /feedback/course/:courseId   (learner)
export const postFeedback = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) return res.status(400).json({ message: 'rating is required (1-5)' });

    const fb = await Feedback.create({
      course: courseId,
      learner: req.user.id,
      rating,
      comment
    });

    res.status(201).json(fb);
  } catch (e) {
    // unique index (course, learner)
    if (e.code === 11000) return res.status(409).json({ message: 'Feedback already submitted' });
    next(e);
  }
};

// GET /feedback/course/:courseId   (public)
export const listCourseFeedback = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const items = await Feedback
      .find({ course: courseId })
      .populate('learner', 'name');
    res.json(items);
  } catch (e) { next(e); }
};
