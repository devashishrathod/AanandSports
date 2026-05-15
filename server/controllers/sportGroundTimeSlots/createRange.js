const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");

const {
  createSportGroundTimeSlotRange,
} = require("../../services/sportGroundTimeSlots");

const {
  validateCreateSportGroundTimeSlotRange,
} = require("../../validator/sportGroundTimeSlots");

exports.createRange = asyncWrapper(async (req, res) => {
  const { error, value } = validateCreateSportGroundTimeSlotRange(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const result = await createSportGroundTimeSlotRange(value);
  return sendSuccess(res, 201, "Time slots created", result);
});
