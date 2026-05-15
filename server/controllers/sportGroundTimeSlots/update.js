const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");

const {
  updateSportGroundTimeSlot,
} = require("../../services/sportGroundTimeSlots");

const {
  validateUpdateSportGroundTimeSlot,
} = require("../../validator/sportGroundTimeSlots");

exports.update = asyncWrapper(async (req, res) => {
  const { error, value } = validateUpdateSportGroundTimeSlot(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const result = await updateSportGroundTimeSlot(req.params?.id, value);
  return sendSuccess(res, 200, "Time slot updated", result);
});
