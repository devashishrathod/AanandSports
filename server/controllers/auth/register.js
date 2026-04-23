const User = require("../../models/User");
const Academy = require("../../models/Academy");
const Banner = require("../../models/Banner");
const { ROLES, LOGIN_TYPES } = require("../../constants");
const { uploadImage } = require("../../services/uploads");
const { asyncWrapper, sendSuccess, throwError } = require("../../utils");

const normalizeFilesToArray = (maybeFiles) => {
  if (!maybeFiles) return [];
  if (Array.isArray(maybeFiles)) return maybeFiles;
  return [maybeFiles];
};

exports.register = asyncWrapper(async (req, res) => {
  let {
    name,
    email,
    password,
    mobile,
    role,
    loginType,
    fcmToken,
    academyName,
    description,
    openingTime,
    closingTime,
  } = req.body;
  const image = req.files?.image;
  const bannersFiles = req.files?.banners;
  if (!mobile && !email) {
    throwError(422, "Email or Mobile number any one of this is required");
  }
  email = email?.toLowerCase();
  name = name?.toLowerCase();
  role = role?.toLowerCase() || ROLES.USER;
  loginType = loginType?.toLowerCase() || LOGIN_TYPES.PASSWORD;
  let user;
  if (email) {
    user = await User.findOne({ email, role, isDeleted: false });
    if (user) throwError(400, "User with this email already exists");
  }
  if (mobile) {
    user = await User.findOne({ mobile, role, isDeleted: false });
    if (user) throwError(400, "User with mobile number already exists");
  }
  let imageUrl = null;
  if (image) imageUrl = await uploadImage(image.tempFilePath);
  const userData = {
    name,
    password,
    email,
    mobile,
    role,
    image: imageUrl,
    fcmToken,
    loginType,
    isLoggedIn: true,
    isOnline: true,
  };
  user = await User.create(userData);
  let message = "User registered successfully";
  let academy = {};
  if (role === ROLES.ACADEMY_MANAGER) {
    academy = await Academy.create({
      ownerId: user._id,
      name: academyName,
      description,
      email,
      mobile,
      image: imageUrl,
      openingTime,
      closingTime,
    });
    user.academyId = academy._id;
    await user.save();
    message = "Academy registered successfully";

    const bannersArray = normalizeFilesToArray(bannersFiles);
    if (bannersArray.length) {
      const bannerIds = [];
      for (let i = 0; i < bannersArray.length; i++) {
        const file = bannersArray[i];
        const imageUrl = await uploadImage(file.tempFilePath);
        const banner = await Banner.create({
          name: `${academy.name}-banner-${Date.now()}-${i}`,
          description: "",
          academyId: academy._id,
          image: imageUrl,
          isActive: true,
        });
        bannerIds.push(banner._id);
      }
      academy.banners = bannerIds;
      academy.updatedAt = new Date();
      await academy.save();
    }
  }
  const token = user.getSignedJwtToken();
  return sendSuccess(res, 201, message, {
    user,
    academy,
    token,
  });
});
