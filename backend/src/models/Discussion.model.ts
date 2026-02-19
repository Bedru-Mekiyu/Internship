import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  replies: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, content: String, createdAt: Date }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

discussionSchema.index({ courseId: 1 });

export const Discussion = mongoose.model('Discussion', discussionSchema);