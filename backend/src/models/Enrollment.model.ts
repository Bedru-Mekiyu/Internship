import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 }, // Percentage
  status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

enrollmentSchema.index({ userId: 1, courseId: 1 });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);