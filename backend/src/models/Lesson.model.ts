import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  content: { type: String }, // HTML/Markdown
  videoUrl: { type: String, default: '' },
  type: { type: String, enum: ['video', 'text', 'quiz', 'assignment'] },
  duration: { type: Number }, // in minutes
  notes: { type: String, default: '' },
  attachments: [{
    name: { type: String, required: true },
    size: { type: String, default: '' },
    url: { type: String, default: '' },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
  }],
  status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

lessonSchema.index({ moduleId: 1 });

export const Lesson = mongoose.model('Lesson', lessonSchema);
