const { asyncWrapper, sendSuccess } = require("../../utils");
const { deleteBooking } = require("../../services/bookings");

exports.deleteBooking = asyncWrapper(async (req, res) => {
  await deleteBooking(req.params?.id, req.user);
  return sendSuccess(res, 200, "Booking deleted successfully");
});
