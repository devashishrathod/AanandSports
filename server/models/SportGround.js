const mongoose = require("mongoose");
const { DEFAULT_IMAGES, SPORT_GROUND_LEVELS } = require("../constants");

const sportGroundSchema = new mongoose.Schema(
  {
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
    },
    // venueId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Venue",
    //   required: true,
    // },
    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    coach: { type: String, trim: true },
    // openingTime: { type: String },
    // closingTime: { type: String },
    level: {
      type: String,
      enum: Object.values(SPORT_GROUND_LEVELS),
      default: SPORT_GROUND_LEVELS.NULL,
    },
    // sportDurationInHours: { type: Number, required: true },
    // sportDate: { type: Date, required: true },
    // sportTiming: { type: Date, required: true },
    maxPlayers: { type: Number, required: true },
    minPlayers: { type: Number, default: 1 },
    maxTeams: { type: Number },
    minTeams: { type: Number },
    features: {
      type: Array,
      default: [],
      validate: [
        (val) =>
          Array.isArray(val) && val.every((f) => f.title && f.description),
        "Features must be an array of objects with title and description",
      ],
    },
    price: { type: Number, required: true },
    // discount: { type: Number },
    // discountType: { type: String, enum: ["percentage", "fixed"] },
    // isPrivate: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    // isFull: { type: Boolean, default: false },
    image: { type: String, default: DEFAULT_IMAGES.SPORT_GROUND },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("SportGround", sportGroundSchema);
