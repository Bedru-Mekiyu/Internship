import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateNumber: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);
