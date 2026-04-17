const User = require("../../models/User");
const Academy = require("../../models/Academy");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.deleteUserById = async (id) => {
  validateObjectId(id, "User Id");

  const user = await User.findById(id);
  if (!user || user.isDeleted) throwError(404, "User not found");

  // soft delete academy if academy manager
  if (user.role === ROLES.ACADEMY_MANAGER && user.academyId) {
    const academy = await Academy.findById(user.academyId);
    if (academy && !academy.isDeleted) {
      academy.isDeleted = true;
      academy.isActive = false;
      academy.updatedAt = new Date();
      await academy.save();
    }
  }
  user.isDeleted = true;
  user.isActive = false;
  user.updatedAt = new Date();
  await user.save();
  return;
};
