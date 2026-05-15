const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
  {
    sportGroundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportGround",
      required: true,
      index: true,
    },
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
      index: true,
    },
    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    startDateTime: { type: Date, required: true, index: true },
    endDateTime: { type: Date, required: true, index: true },
    sportDurationInHours: { type: Number, required: true },
    noOfPlayers: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isFull: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

timeSlotSchema.index(
  { sportGroundId: 1, startDateTime: 1, endDateTime: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

module.exports = mongoose.model("TimeSlot", timeSlotSchema);
