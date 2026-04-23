const { asyncWrapper, sendSuccess } = require("../../utils");
const { initiateBookingPayment } = require("../../services/bookings");

exports.initiatePayment = asyncWrapper(async (req, res) => {
  const result = await initiateBookingPayment(req.params?.id, req.userId);
  return sendSuccess(res, 200, "Booking payment initiated", result);
});
