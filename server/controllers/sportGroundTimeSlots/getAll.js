const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");

const {
  getAllSportGroundTimeSlots,
} = require("../../services/sportGroundTimeSlots");

const {
  validateGetAllSportGroundTimeSlotsQuery,
} = require("../../validator/sportGroundTimeSlots");

exports.getAll = asyncWrapper(async (req, res) => {
  const { error, value } = validateGetAllSportGroundTimeSlotsQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));

  const result = await getAllSportGroundTimeSlots(value);
  return sendSuccess(res, 200, "Time slots fetched", result);
});
