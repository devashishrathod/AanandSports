const mongoose = require("mongoose");
const User = require("../../models/User");
const Booking = require("../../models/Booking");
const { pagination, validateObjectId, throwError } = require("../../utils");
const { ROLES } = require("../../constants");

exports.getAllBookings = async (query, tokenUserId) => {
  const user = await User.findById(tokenUserId);
  if (!user) throwError(404, "User not found");
  let {
    page,
    limit,
    userId,
    sportGroundId,
    status,
    paymentStatus,
    paymentId,
    fromStartTime,
    toStartTime,
    fromEndTime,
    toEndTime,
    fromDate,
    toDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const match = {};

  // Non-admin can only view own
  if (user.role !== ROLES.ADMIN && user.role !== "academy_manager") {
    match.userId = new mongoose.Types.ObjectId(tokenUserId);
  } else if (userId) {
    validateObjectId(userId, "User Id");
    match.userId = new mongoose.Types.ObjectId(userId);
  }

  if (sportGroundId) {
    validateObjectId(sportGroundId, "SportGround Id");
    match.sportGroundId = new mongoose.Types.ObjectId(sportGroundId);
  }

  if (status) match.status = status;
  if (paymentStatus) match.paymentStatus = paymentStatus;
  if (paymentId) match.paymentId = { $regex: new RegExp(paymentId, "i") };

  if (fromStartTime || toStartTime) {
    match.startTime = {};
    if (fromStartTime) match.startTime.$gte = new Date(fromStartTime);
    if (toStartTime) {
      const d = new Date(toStartTime);
      match.startTime.$lte = d;
    }
  }

  if (fromEndTime || toEndTime) {
    match.endTime = {};
    if (fromEndTime) match.endTime.$gte = new Date(fromEndTime);
    if (toEndTime) {
      const d = new Date(toEndTime);
      match.endTime.$lte = d;
    }
  }

  if (fromDate || toDate) {
    match.createdAt = {};
    if (fromDate) match.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      const d = new Date(toDate);
      d.setHours(23, 59, 59, 999);
      match.createdAt.$lte = d;
    }
  }

  const pipeline = [{ $match: match }];

  const sortStage = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });

  const result = await pagination(Booking, pipeline, page, limit);
  await Booking.populate(result.data, [
    { path: "userId", select: "name email mobile role" },
    {
      path: "sportGroundId",
      select:
        "name sportDate sportDurationInHours sportTiming venueId sportId categoryId",
      populate: [
        { path: "venueId", select: "name description image" },
        { path: "sportId", select: "name description image" },
        { path: "categoryId", select: "name description image" },
      ],
    },
  ]);

  return result;
};
