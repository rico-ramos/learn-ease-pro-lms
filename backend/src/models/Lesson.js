import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  title: { type: String, required: true },
  contentType: { type: String, enum: ['video', 'pdf', 'link', 'text'], default: 'video' },
  contentUrl: String,     // e.g. S3/Cloudinary URL
  text: String,           // for plain text lessons
  durationSec: Number,    // estimated or actual duration
  order: { type: Number, default: 0, index: true }
}, { timestamps: true });

export default mongoose.model('Lesson', LessonSchema);
