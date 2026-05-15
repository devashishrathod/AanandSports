const Booking = require("../../models/Booking");
const Academy = require("../../models/Academy");
const SportGround = require("../../models/SportGround");
const TimeSlot = require("../../models/TimeSlot");
const User = require("../../models/User");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.createBooking = async (tokenUserId, payload) => {
  const user = await User.findById(tokenUserId);
  if (!user || user.isDeleted) {
    throwError(404, "User not found");
  }
  let { userId, timeSlotId } = payload;

  validateObjectId(timeSlotId, "TimeSlot Id");
  const timeSlot = await TimeSlot.findById(timeSlotId);
  if (!timeSlot || timeSlot.isDeleted) throwError(404, "Time slot not found");

  validateObjectId(timeSlot.sportGroundId, "SportGround Id");
  const sportGround = await SportGround.findById(timeSlot.sportGroundId);
  if (!sportGround || sportGround.isDeleted)
    throwError(404, "Sport ground not found");

  const academy = await Academy.findById(timeSlot.academyId);
  if (!academy || academy.isDeleted) throwError(404, "Academy not found");

  let finalUserId;
  if (user.role === ROLES.ADMIN && userId) {
    validateObjectId(userId, "User Id");
    const foundUser = await User.findById(userId);
    if (!foundUser || foundUser.isDeleted || foundUser.role !== ROLES.USER)
      throwError(404, "Invalid user! Aanand Sports user not found");
    finalUserId = userId;
  } else if (user.role === ROLES.ADMIN && !userId) {
    throwError(400, "User Id is required");
  } else if (user.role !== ROLES.ADMIN) {
    finalUserId = user._id;
  }
  if (!finalUserId) throwError(401, "Access denied");

  const startTime = new Date(timeSlot.startDateTime);
  const endTime = new Date(timeSlot.endDateTime);
  if (isNaN(startTime.getTime()))
    throwError(422, "Invalid time slot startDateTime");
  if (isNaN(endTime.getTime()))
    throwError(422, "Invalid time slot endDateTime");
  if (endTime.getTime() <= startTime.getTime()) {
    throwError(422, "Invalid time slot time range");
  }

  const now = new Date();
  if (startTime.getTime() < now.getTime()) {
    throwError(400, "Past time slots are not allowed");
  }

  const existing = await Booking.findOne({
    timeSlotId,
    userId: finalUserId,
    status: { $ne: "cancelled" },
  });
  if (existing) throwError(400, "This slot is already booked");

  if (timeSlot.isFull) {
    throwError(400, "This slot is full");
  }

  if (timeSlot.noOfPlayers >= sportGround.maxPlayers) {
    throwError(400, "This slot is full");
  }

  const created = await Booking.create({
    userId: finalUserId,
    academyId: academy._id,
    sportGroundId: sportGround._id,
    timeSlotId,
    startTime,
    endTime,
    price: sportGround.price || 0,
  });

  await TimeSlot.findByIdAndUpdate(timeSlotId, {
    $inc: { noOfPlayers: 1 },
    $set: {
      isFull: timeSlot.noOfPlayers + 1 >= sportGround.maxPlayers,
    },
  });

  return await Booking.findById(created._id)
    .populate({ path: "userId", select: "name email mobile role" })
    .populate({ path: "academyId" })
    .populate({
      path: "timeSlotId",
      select:
        "sportGroundId startDateTime endDateTime sportDurationInHours noOfPlayers isAvailable isFull isActive",
    })
    .populate({
      path: "sportGroundId",
      select: "name sportId categoryId",
      populate: [
        { path: "sportId", select: "name description image" },
        { path: "categoryId", select: "name description image" },
      ],
    });
};
