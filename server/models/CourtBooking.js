const mongoose = require("mongoose");

const bookingItemSchema = new mongoose.Schema(
  {
    _id: false,
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
    },
    groundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ground",
      required: true,
    },
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: true,
    },
    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    slotStarts: { type: [Date], default: [] },
    price: { type: Number, default: 0 },
    academyAmount: { type: Number, default: 0 },
    platformAmount: { type: Number, default: 0 },
  },
  { versionKey: false },
);

const courtBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [bookingItemSchema], default: [] },
    totalPrice: { type: Number, default: 0 },
    academyAmount: { type: Number, default: 0 },
    platformAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    paymentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("CourtBooking", courtBookingSchema);
