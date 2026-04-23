const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { verifyBookingPayment } = require("../../services/bookings");
const { validateVerifyRazorpayPayment } = require("../../validator/payments");

exports.verifyPayment = asyncWrapper(async (req, res) => {
  const { error, value } = validateVerifyRazorpayPayment(req.body);
  if (error) throwError(422, cleanJoiError(error));

  await verifyBookingPayment(value);
  return sendSuccess(res, 200, "Booking payment verified");
});
