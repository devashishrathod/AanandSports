const Booking = require("../../models/Booking");
const Academy = require("../../models/Academy");
const SportGround = require("../../models/SportGround");
const User = require("../../models/User");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.createBooking = async (tokenUserId, payload) => {
  const user = await User.findById(tokenUserId);
  if (!user || user.isDeleted) {
    throwError(404, "User not found");
  }
  let { userId, sportGroundId, price, status, paymentStatus, paymentId } =
    payload;

  validateObjectId(sportGroundId, "SportGround Id");
  const sportGround = await SportGround.findById(sportGroundId);
  if (!sportGround || sportGround.isDeleted)
    throwError(404, "Sport ground not found");

  const academy = await Academy.findById(sportGround.academyId);
  if (!academy || academy.isDeleted) throwError(404, "Academy not found");

  let finalUserId;
  if (user.role === ROLES.ADMIN && userId) {
    validateObjectId(userId, "User Id");
    const foundUser = await User.findById(userId);
    if (!foundUser || foundUser.isDeleted || foundUser.role !== ROLES.USER)
      throwError(404, "Invalid user! Aanand Sports user not found");
    finalUserId = userId;
  } else if (user.role === ROLES.ADMIN && !userId) {
    throwError(400, "User Id is required");
  } else if (user.role !== ROLES.ADMIN) {
    finalUserId = user._id;
  }
  if (!finalUserId) throwError(401, "Access denied");

  const startTime = new Date(sportGround.sportDate);
  if (isNaN(startTime.getTime()))
    throwError(422, "Invalid sport ground sportDate");

  const duration = Number(sportGround.sportDurationInHours || 0);
  if (!duration || duration <= 0)
    throwError(422, "Invalid sportDurationInHours on sport ground");

  const endTime = new Date(startTime);
  endTime.setTime(endTime.getTime() + duration * 60 * 60 * 1000);

  const overlap = await Booking.findOne({
    sportGroundId,
    userId: finalUserId,
    status: { $ne: "cancelled" },
    $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
  });
  if (overlap) throwError(400, "This slot is already booked for this user");

  const created = await Booking.create({
    userId: finalUserId,
    academyId: academy._id,
    sportGroundId,
    startTime,
    endTime,
    price,
    status,
    paymentStatus,
    paymentId,
  });

  return await Booking.findById(created._id)
    .populate({ path: "userId", select: "name email mobile role" })
    .populate({ path: "academyId" })
    .populate({
      path: "sportGroundId",
      select:
        "name sportDate sportDurationInHours sportTiming venueId sportId categoryId",
      populate: [
        { path: "venueId", select: "name description image" },
        { path: "sportId", select: "name description image" },
        { path: "categoryId", select: "name description image" },
      ],
    });
};
