const Booking = require("../../models/Booking");
const User = require("../../models/User");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.getBooking = async (userId, id) => {
  validateObjectId(userId, "User Id");
  const user = await User.findById(userId);
  if (!user) throwError(404, "User not found");

  validateObjectId(id, "Booking Id");

  const booking = await Booking.findById(id)
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

  if (!booking) throwError(404, "Booking not found");
  if (user.role !== ROLES.ADMIN) {
    if (String(booking.userId?._id || booking.userId) !== String(userId)) {
      throwError(
        403,
        "Forbidden! You are not authorized to access this booking",
      );
    }
  }
  return booking;
};
