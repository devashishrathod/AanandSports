const { asyncWrapper, sendSuccess } = require("../../utils");
const { initiateCourtBookingPayment } = require("../../services/courtBookings");

exports.initiatePayment = asyncWrapper(async (req, res) => {
  const result = await initiateCourtBookingPayment(req.params?.id, req.userId);
  return sendSuccess(res, 200, "Court booking payment initiated", result);
});
