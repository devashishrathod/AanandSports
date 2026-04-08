const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { createBooking } = require("../../services/bookings");
const { validateCreateBooking } = require("../../validator/bookings");

exports.create = asyncWrapper(async (req, res) => {
  const { error, value } = validateCreateBooking(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const booking = await createBooking(req.userId, value);
  return sendSuccess(res, 201, "Booking created", booking);
});
