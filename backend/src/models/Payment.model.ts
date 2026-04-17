import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  method: { type: String },
  provider: { type: String, enum: ['stripe', 'paypal', 'bank_transfer'], default: 'stripe' },
  externalPaymentId: { type: String },
  transactionId: { type: String },
  checkoutUrl: { type: String },
  webhookEventId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ externalPaymentId: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
