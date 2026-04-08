const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { getAllBookings } = require("../../services/bookings");
const { validateGetAllBookingsQuery } = require("../../validator/bookings");

exports.getAll = asyncWrapper(async (req, res) => {
  const { error, value } = validateGetAllBookingsQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));

  const result = await getAllBookings(value, req.userId);
  return sendSuccess(res, 200, "Bookings fetched", result);
});
