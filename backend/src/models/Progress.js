import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
  completed: { type: Boolean, default: false },
  secondsWatched: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent duplicates per learner + lesson
ProgressSchema.index({ learner: 1, lesson: 1 }, { unique: true });

export default mongoose.model('Progress', ProgressSchema);
