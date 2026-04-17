import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'], required: true },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  points: { type: Number, default: 1 },
  explanation: { type: String },
}, { _id: false });

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  title: { type: String, required: true },
  description: { type: String },
  questions: [quizQuestionSchema],
  timeLimit: { type: Number },
  attempts: { type: Number, default: 1 },
  passingScore: { type: Number, default: 70 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

quizSchema.index({ lessonId: 1, isPublished: 1 });
quizSchema.index({ courseId: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
