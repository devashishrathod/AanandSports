const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { getAllSportGrounds } = require("../../services/sportGrounds");
const {
  validateGetAllSportGroundsQuery,
} = require("../../validator/sportGrounds");

exports.getAll = asyncWrapper(async (req, res) => {
  const { error, value } = validateGetAllSportGroundsQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));

  const result = await getAllSportGrounds(req.userId, value);
  return sendSuccess(res, 200, "Sport grounds fetched", result);
});
