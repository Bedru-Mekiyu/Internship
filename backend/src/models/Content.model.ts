import mongoose from 'mongoose';

const contentBlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'text', 'image', 'video', 'gallery', 'form', 'testimonial'
  content: { type: mongoose.Schema.Types.Mixed, required: true }, // Any structure depending on block type
  styles: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  order: { type: Number, required: true }
}, { _id: false });

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['page', 'post', 'block'] },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  blocks: [contentBlockSchema],
  slug: { type: String, unique: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date },
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Content = mongoose.model('Content', contentSchema);
