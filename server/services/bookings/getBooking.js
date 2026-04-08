const Booking = require("../../models/Booking");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.getBooking = async (userId, id) => {
  validateObjectId(userId, "User Id");
  const user = await User.findById(userId);
  if (!user) throwError(404, "User not found");

  validateObjectId(id, "Booking Id");

  const booking = await Booking.findById(id)
    .populate({ path: "userId", select: "name email mobile role" })
    .populate({
      path: "sportGroundId",
      select:
        "name sportDate sportDurationInHours sportTiming venueId sportId categoryId",
      populate: [
        { path: "venueId", select: "name description image" },
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
