import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  provider: { type: String, enum: ['jitsi', 'google-meet', 'zoom', 'custom'], default: 'custom' },
  meetingUrl: { type: String, required: true },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date },
  status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

liveSessionSchema.index({ courseId: 1, startsAt: 1 });
liveSessionSchema.index({ instructorId: 1, startsAt: -1 });

export const LiveSession = mongoose.model('LiveSession', liveSessionSchema);
