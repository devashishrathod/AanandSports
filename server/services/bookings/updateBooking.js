const Booking = require("../../models/Booking");
const SportGround = require("../../models/SportGround");
const User = require("../../models/User");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.updateBooking = async (id, payload = 0, authUserId) => {
  const user = await User.findById(authUserId);
  if (!user) throwError(404, "User not found");

  validateObjectId(id, "Booking Id");
  const booking = await Booking.findById(id);
  if (!booking) throwError(404, "Booking not found");

  const isAdmin = user?.role === ROLES.ADMIN;
  //if (!isAdmin) {
   // if (String(booking.userId) !== String(user._id)) {
    //  throwError(
     //   403,
    //    "Forbidden! You are not authorized to update this booking",
  //  )  );
  // }
//  }

  if (payload) {
    let { userId, sportGroundId, price, status, paymentStatus, paymentId } =
      payload;

    if (userId && isAdmin) {
      validateObjectId(userId, "User Id");
      const user = await User.findById(userId);
      if (!user || user.isDeleted) throwError(404, "User not found");
      booking.userId = userId;
    }

    if (sportGroundId && isAdmin) {
      validateObjectId(sportGroundId, "SportGround Id");
      const sportGround = await SportGround.findById(sportGroundId);
      if (!sportGround || sportGround.isDeleted)
        throwError(404, "Sport ground not found");

      const startTime = new Date(sportGround.sportDate);
      const duration = Number(sportGround.sportDurationInHours || 0);
      if (!duration || duration <= 0)
        throwError(422, "Invalid sportDurationInHours on sport ground");

      const endTime = new Date(startTime);
      endTime.setTime(endTime.getTime() + duration * 60 * 60 * 1000);

      const overlap = await Booking.findOne({
        _id: { $ne: id },
        sportGroundId,
        status: { $ne: "cancelled" },
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      });
      if (overlap) throwError(400, "This slot is already booked");

      booking.sportGroundId = sportGroundId;
      booking.startTime = startTime;
      booking.endTime = endTime;
    }

    if (typeof price !== "undefined") booking.price = price;
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (typeof paymentId !== "undefined") booking.paymentId = paymentId;
  }

  booking.updatedAt = new Date();
  await booking.save();

  return await Booking.findById(id)
    .populate({ path: "userId", select: "name email mobile role" })
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
