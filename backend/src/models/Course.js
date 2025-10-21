import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, index: 'text' },
  slug: { type: String, unique: true },
  description: String,
  category: { type: String, index: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // faculty
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin
  isPublished: { type: Boolean, default: false },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Course', CourseSchema);
