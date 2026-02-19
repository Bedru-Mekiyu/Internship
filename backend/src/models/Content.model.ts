import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['page', 'post', 'block'] },
  title: { type: String, required: true },
  content: { type: String, required: true }, // JSON/HTML
  slug: { type: String, unique: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

contentSchema.index({ slug: 1 });

export const Content = mongoose.model('Content', contentSchema);