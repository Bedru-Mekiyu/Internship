import mongoose from 'mongoose';

export interface IModule extends mongoose.Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: string;
  lessons: mongoose.Types.ObjectId[] | any[];
  order: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, default: 'Core' },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  order: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

moduleSchema.index({ courseId: 1, order: 1 });

export const Module = mongoose.model<IModule>('Module', moduleSchema);
