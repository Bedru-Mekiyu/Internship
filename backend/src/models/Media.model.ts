import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

mediaSchema.index({ createdAt: -1 });

export const Media = mongoose.model('Media', mediaSchema);