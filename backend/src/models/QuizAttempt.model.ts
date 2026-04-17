import mongoose from 'mongoose';

const quizAnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  answer: { type: mongoose.Schema.Types.Mixed },
  isCorrect: { type: Boolean },
  pointsAwarded: { type: Number, default: 0 },
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [quizAnswerSchema],
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

quizAttemptSchema.index({ quizId: 1, userId: 1, submittedAt: -1 });

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
