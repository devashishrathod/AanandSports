const Booking = require("../../models/Booking");
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

  await Booking.deleteOne({ _id: id });
  return;
};
