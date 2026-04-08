const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { updateBooking } = require("../../services/bookings");
const { validateUpdateBooking } = require("../../validator/bookings");

exports.update = asyncWrapper(async (req, res) => {
  const { error, value } = validateUpdateBooking(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const updated = await updateBooking(req.params?.id, value, req.userId);
  return sendSuccess(res, 200, "Booking updated", updated);
});
