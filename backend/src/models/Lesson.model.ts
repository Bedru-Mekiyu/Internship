import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  content: { type: String }, // HTML/Markdown
  type: { type: String, enum: ['video', 'text', 'quiz', 'assignment'] },
  duration: { type: Number }, // in minutes
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

lessonSchema.index({ moduleId: 1 });

export const Lesson = mongoose.model('Lesson', lessonSchema);
