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

  if (user.role !== ROLES.ADMIN && user.role !== "academy_manager"){
    match.userId = new mongoose.Types.ObjectId(tokenUserId);
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
    { path: "items.groundId" },
    { path: "items.courtId" },
    { path: "items.sportId", select: "name description image" },
  ]);

  return result;
};
