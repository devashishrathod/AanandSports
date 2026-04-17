const { asyncWrapper, sendSuccess } = require("../../utils");
const { deleteUserById } = require("../../services/users");

exports.deleteUser = asyncWrapper(async (req, res) => {
  await deleteUserById(req.params?.id);
  return sendSuccess(res, 200, "User deleted");
});
