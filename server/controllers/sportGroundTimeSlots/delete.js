const { asyncWrapper, sendSuccess } = require("../../utils");

const {
  deleteSportGroundTimeSlot,
} = require("../../services/sportGroundTimeSlots");

exports.deleteTimeSlot = asyncWrapper(async (req, res) => {
  const result = await deleteSportGroundTimeSlot(req.params?.id);
  return sendSuccess(res, 200, "Time slot deleted", result);
});
