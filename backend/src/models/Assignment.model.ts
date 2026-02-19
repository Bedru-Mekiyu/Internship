import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

assignmentSchema.index({ courseId: 1 });

export const Assignment = mongoose.model("Assignment", assignmentSchema);
