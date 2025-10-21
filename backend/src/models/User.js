import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'learner'], default: 'learner', index: true },
  avatarUrl: String,
  bio: String,
  settings: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    locale: { type: String, default: 'en' }
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
