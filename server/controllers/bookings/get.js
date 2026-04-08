const { asyncWrapper, sendSuccess } = require("../../utils");
const { getBooking } = require("../../services/bookings");

exports.get = asyncWrapper(async (req, res) => {
  const booking = await getBooking(req.userId, req.params?.id);
  return sendSuccess(res, 200, "Booking fetched", booking);
});
