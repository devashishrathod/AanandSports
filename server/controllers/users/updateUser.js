const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { updateUserById } = require("../../services/users");
const { validateUpdateUser } = require("../../validator/users");

exports.updateUser = asyncWrapper(async (req, res) => {
  const userId = req.query?.userId || req.userId;
  const { error } = validateUpdateUser(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const image = req.files?.image;
  const updatedUser = await updateUserById(userId, req.body, image);
  return sendSuccess(
    res,
    200,
    "User profile updated successfully",
    updatedUser,
  );
});
