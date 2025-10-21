import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String }
}, { timestamps: true });

// A learner can leave at most one feedback per course
FeedbackSchema.index({ course: 1, learner: 1 }, { unique: true });

export default mongoose.model('Feedback', FeedbackSchema);
