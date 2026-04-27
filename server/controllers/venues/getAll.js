const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { getAllVenues } = require("../../services/venues");
const { validateGetAllVenuesQuery } = require("../../validator/venues");

exports.getAll = asyncWrapper(async (req, res) => {
  const { error, value } = validateGetAllVenuesQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));
  const result = await getAllVenues(req.userId, value);
  return sendSuccess(res, 200, "Venues fetched", result);
});
