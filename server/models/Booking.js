const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
    },
    sportGroundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportGround",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    price: { type: Number },
    academyAmount: { type: Number, default: 0 },
    platformAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Booking", bookingSchema);
