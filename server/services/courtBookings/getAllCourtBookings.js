const mongoose = require("mongoose");
const CourtBooking = require("../../models/CourtBooking");
const User = require("../../models/User");
const { pagination, throwError } = require("../../utils");
const { ROLES } = require("../../constants");

exports.getAllCourtBookings = async (query, tokenUserId) => {
  const user = await User.findById(tokenUserId);
  if (!user) throwError(404, "User not found");

  let {
    page,
    limit,
    userId,
    academyId,
    groundId,
    courtId,
    sportId,
    status,
    paymentStatus,
    fromDate,
    toDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const match = {};

  const isAdmin = user.role === ROLES.ADMIN;
  const isAcademyManager = user.role === ROLES.ACADEMY_MANAGER;

  if (!isAdmin && !isAcademyManager) {
    match.userId = new mongoose.Types.ObjectId(tokenUserId);
  } else if (isAcademyManager) {
    match["items.academyId"] = new mongoose.Types.ObjectId(user.academyId);
  } else if (userId) {
    match.userId = new mongoose.Types.ObjectId(userId);
  }

  if (academyId) {
    match["items.academyId"] = new mongoose.Types.ObjectId(academyId);
  }

  if (groundId) {
    match["items.groundId"] = new mongoose.Types.ObjectId(groundId);
  }

  if (courtId) {
    match["items.courtId"] = new mongoose.Types.ObjectId(courtId);
  }

  if (sportId) {
    match["items.sportId"] = new mongoose.Types.ObjectId(sportId);
  }

  if (status) match.status = status;
  if (paymentStatus) match.paymentStatus = paymentStatus;

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

  const result = await pagination(CourtBooking, pipeline, page, limit);

  await CourtBooking.populate(result.data, [
    { path: "userId", select: "name email mobile role" },
    { path: "items.academyId" },
    { path: "items.groundId" },
    { path: "items.courtId" },
    { path: "items.sportId", select: "name description image" },
  ]);

  return result;
};
