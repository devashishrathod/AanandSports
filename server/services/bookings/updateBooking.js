const Booking = require("../../models/Booking");
const SportGround = require("../../models/SportGround");
const Academy = require("../../models/Academy");
const TimeSlot = require("../../models/TimeSlot");
const User = require("../../models/User");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.updateBooking = async (id, payload = 0, authUserId) => {
  const user = await User.findById(authUserId);
  if (!user) throwError(404, "User not found");

  validateObjectId(id, "Booking Id");
  const booking = await Booking.findById(id);
  if (!booking) throwError(404, "Booking not found");

  const isAdmin = user?.role === ROLES.ADMIN;
  //if (!isAdmin) {
  // if (String(booking.userId) !== String(user._id)) {
  //  throwError(
  //   403,
  //    "Forbidden! You are not authorized to update this booking",
  //  )  );
  // }
  //  }

  if (payload) {
    let { userId, timeSlotId, price, status, paymentStatus, paymentId } =
      payload;

    if (userId && isAdmin) {
      validateObjectId(userId, "User Id");
      const user = await User.findById(userId);
      if (!user || user.isDeleted) throwError(404, "User not found");
      booking.userId = userId;
    }

    if (timeSlotId && isAdmin) {
      validateObjectId(timeSlotId, "TimeSlot Id");
      const slot = await TimeSlot.findById(timeSlotId);
      if (!slot || slot.isDeleted) throwError(404, "Time slot not found");

      const startTime = new Date(slot.startDateTime);
      const endTime = new Date(slot.endDateTime);
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

      const sportGround = await SportGround.findById(slot.sportGroundId);
      if (!sportGround || sportGround.isDeleted)
        throwError(404, "Sport ground not found");

      const academy = await Academy.findById(slot.academyId);
      if (!academy || academy.isDeleted) throwError(404, "Academy not found");

      const existing = await Booking.findOne({
        _id: { $ne: id },
        timeSlotId,
        userId: booking.userId,
        status: { $ne: "cancelled" },
      });
      if (existing) throwError(400, "This slot is already booked");

      if (slot.isFull) {
        throwError(400, "This slot is full");
      }

      if (slot.noOfPlayers >= sportGround.maxPlayers) {
        throwError(400, "This slot is full");
      }

      const oldTimeSlotId = booking.timeSlotId;
      const oldSportGroundId = booking.sportGroundId;

      if (oldTimeSlotId && String(oldTimeSlotId) !== String(timeSlotId)) {
        const oldTimeSlot = await TimeSlot.findById(oldTimeSlotId);
        const oldSportGround = await SportGround.findById(oldSportGroundId);
        if (oldTimeSlot && oldSportGround && oldTimeSlot.noOfPlayers > 0) {
          await TimeSlot.findByIdAndUpdate(oldTimeSlotId, {
            $inc: { noOfPlayers: -1 },
            $set: {
              isFull: oldTimeSlot.noOfPlayers - 1 < oldSportGround.maxPlayers,
            },
          });
        }
      }

      booking.timeSlotId = timeSlotId;
      booking.sportGroundId = sportGround._id;
      booking.academyId = academy._id;
      booking.startTime = startTime;
      booking.endTime = endTime;
      booking.price = sportGround.price || booking.price;
    }

    if (typeof price !== "undefined") booking.price = price;
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (typeof paymentId !== "undefined") booking.paymentId = paymentId;
  }

  booking.updatedAt = new Date();
  await booking.save();

  if (payload && payload.timeSlotId && isAdmin) {
    const slot = await TimeSlot.findById(payload.timeSlotId);
    const sportGround = await SportGround.findById(booking.sportGroundId);
    if (slot && sportGround) {
      await TimeSlot.findByIdAndUpdate(payload.timeSlotId, {
        $inc: { noOfPlayers: 1 },
        $set: {
          isFull: slot.noOfPlayers + 1 >= sportGround.maxPlayers,
        },
      });
    }
  }

  return await Booking.findById(id)
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
