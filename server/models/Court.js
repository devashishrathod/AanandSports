const mongoose = require("mongoose");

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    groundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ground",
      required: true,
    },
    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    pricePerHour: { type: Number },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Court", courtSchema);
