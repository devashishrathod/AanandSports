const User = require("../../models/User");
const Academy = require("../../models/Academy");
const { throwError } = require("../../utils");
const { uploadImage, deleteImage } = require("../uploads");
const { isAdult } = require("../../helpers/users");
const { ROLES } = require("../../constants");

exports.updateUserById = async (userId, payload, image) => {
  const user = await User.findById(userId);
  if (!user || user?.isDeleted) throwError(404, "User not found");
  let academy = {};
  if (payload) {
    const isAcademyManager = user.role === ROLES.ACADEMY_MANAGER;
    if (isAcademyManager) {
      academy = await Academy.findById(user.academyId);
      if (!academy || academy.isDeleted) throwError(404, "Academy not found");
    }
    let {
      name,
      email,
      mobile,
      dob,
      address,
      academyName,
      description,
      openingTime,
      closingTime,
    } = payload;
    if (name) user.name = name?.toLowerCase();
    if (address) user.address = address?.toLowerCase();
    if (dob) {
      if (!isAdult(dob)) throwError(400, "User must be at least 18 years old");
      user.dob = dob;
    }
    if (email && email !== user.email) {
      email = email?.toLowerCase();
      const emailExists = await User.findOne({
        email,
        role: user.role,
        _id: { $ne: userId },
        isDeleted: false,
      });
      if (emailExists) {
        throwError(400, "Email already exists with another user");
      }
      user.email = email;
      user.isEmailVerified = false;
      if (isAcademyManager) academy.email = email;
    }
    if (mobile && mobile !== user.mobile) {
      const mobileExists = await User.findOne({
        mobile,
        role: user.role,
        _id: { $ne: userId },
        isDeleted: false,
      });
      if (mobileExists) {
        throwError(400, "Mobile number already exists with another user");
      }
      user.mobile = mobile;
      user.isMobileVerified = false;
      if (isAcademyManager) academy.mobile = mobile;
    }
    if (isAcademyManager) {
      if (academyName || description || openingTime || closingTime) {
        if (academyName) academy.name = academyName;
        if (typeof description !== "undefined")
          academy.description = description;
        if (typeof openingTime !== "undefined")
          academy.openingTime = openingTime;
        if (typeof closingTime !== "undefined")
          academy.closingTime = closingTime;
        academy.updatedAt = new Date();
        await academy.save();
      }
    }
  }
  if (image) {
    if (user.image) await deleteImage(user.image);
    const imageUrl = await uploadImage(image.tempFilePath);
    user.image = imageUrl;
    user.updatedAt = new Date();
    await user.save();
    if (isAcademyManager) {
      if (academy.image) await deleteImage(academy.image);
      academy.image = imageUrl;
      academy.updatedAt = new Date();
      await academy.save();
    }
  }
  const { password, otp, ...userData } = user.toObject();
  return { ...userData, academy };
};
