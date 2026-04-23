const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { verifyCourtBookingPayment } = require("../../services/courtBookings");
const { validateVerifyRazorpayPayment } = require("../../validator/payments");

exports.verifyPayment = asyncWrapper(async (req, res) => {
  const { error, value } = validateVerifyRazorpayPayment(req.body);
  if (error) throwError(422, cleanJoiError(error));

  await verifyCourtBookingPayment(value);
  return sendSuccess(res, 200, "Court booking payment verified");
});
