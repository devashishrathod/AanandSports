const Booking = require("../../models/Booking");
const TimeSlot = require("../../models/TimeSlot");
const SportGround = require("../../models/SportGround");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.deleteBooking = async (id, authUser) => {
  validateObjectId(id, "Booking Id");
  const booking = await Booking.findById(id);
  if (!booking) throwError(404, "Booking not found");

  const isAdmin = authUser?.role === ROLES.ADMIN;
  if (!isAdmin) {
    if (String(booking.userId) !== String(authUser?._id)) {
      throwError(403, "Forbidden");
    }
  }

  const timeSlot = await TimeSlot.findById(booking.timeSlotId);
  if (timeSlot && !timeSlot.isDeleted && timeSlot.noOfPlayers > 0) {
    const sportGround = await SportGround.findById(booking.sportGroundId);
    if (sportGround) {
      await TimeSlot.findByIdAndUpdate(booking.timeSlotId, {
        $inc: { noOfPlayers: -1 },
        $set: {
          isFull: timeSlot.noOfPlayers - 1 < sportGround.maxPlayers,
        },
      });
    }
  }

  await Booking.deleteOne({ _id: id });
  return;
};
