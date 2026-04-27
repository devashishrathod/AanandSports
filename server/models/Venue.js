const mongoose = require("mongoose");
const { DEFAULT_IMAGES } = require("../constants");
const { locationField } = require("./validObjectId");

const venueSchema = new mongoose.Schema(
  {
    locationId: { ...locationField, required: true },
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Academy",
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, default: DEFAULT_IMAGES.VENUE },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

venueSchema.index(
  { locationId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

module.exports = mongoose.model("Venue", venueSchema);
