const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    courtBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtBooking",
      default: null,
    },
    transactionType: {
      type: String,
      enum: ["ORDER", "BOOKING", "COURT_BOOKING"],
      default: "ORDER",
      index: true,
    },
    gateway: {
      type: String,
      enum: ["RAZORPAY"],
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: Number,
    academyAmount: { type: Number, default: 0 },
    platformAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    rawResponse: Object,
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Transaction", transactionSchema);
