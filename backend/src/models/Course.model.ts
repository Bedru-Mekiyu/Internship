import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  thumbnail: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  language: { type: String, default: 'en' },
  pricing: { 
    type: { type: String, enum: ['free', 'paid', 'subscription'] }, 
    amount: { type: Number, default: 0 }, 
    currency: { type: String, default: 'USD' }, 
    discount: { percentage: Number, validUntil: Date } 
  },
  duration: { type: Number }, // in minutes
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  tags: [{ type: String }],
  prerequisites: [{ type: String }],
  learningOutcomes: [{ type: String }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  featured: { type: Boolean, default: false },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  enrollmentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.index({ slug: 1, instructor: 1 });

export const Course = mongoose.model('Course', courseSchema);