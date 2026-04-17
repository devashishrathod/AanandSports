const mongoose = require("mongoose");

const groundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    sports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sport" }],
    sportsMeta: [
      {
        sportId: { type: mongoose.Schema.Types.ObjectId, ref: "Sport" },
        noOfCourts: { type: Number, default: 0 },
      },
    ],
    banners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Banner" }],
    type: { type: String, required: true, trim: true },
    noOfCourts: { type: Number, default: 0 },
    openingTime: { type: String, required: true, trim: true },
    closingTime: { type: String, required: true, trim: true },
    pricePerHour: { type: Number, required: true },
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

module.exports = mongoose.model("Ground", groundSchema);
