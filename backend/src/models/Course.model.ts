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
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  enrollmentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.index({ slug: 1, instructor: 1 });
courseSchema.index({ status: 1, instructor: 1, updatedAt: -1 });
courseSchema.index({ status: 1, updatedAt: -1 });
courseSchema.index({ status: 1, category: 1, updatedAt: -1 });
courseSchema.index({ status: 1, featured: 1, updatedAt: -1 });

export const Course = mongoose.model('Course', courseSchema);