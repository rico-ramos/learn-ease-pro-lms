import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  status: { type: String, enum: ['requested', 'approved', 'rejected'], default: 'requested', index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // admin or faculty
}, { timestamps: true });

// Prevent duplicate enrollment requests
EnrollmentSchema.index({ learner: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', EnrollmentSchema);
