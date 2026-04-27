const mongoose = require("mongoose");
const User = require("../../models/User");
const Venue = require("../../models/Venue");
const { pagination, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.getAllVenues = async (userId, query) => {
  let {
    page,
    limit,
    search,
    name,
    academyId,
    locationId,
    isActive,
    fromDate,
    toDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const match = { isDeleted: false };

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throwError(404, "Unauthorized user! User not found");
  }
  const isAcademyManager = user?.role === ROLES.ACADEMY_MANAGER;
  if (isAcademyManager) {
    match.academyId = new mongoose.Types.ObjectId(user.academyId);
  } else if (academyId) {
    validateObjectId(academyId, "Academy Id");
    match.academyId = new mongoose.Types.ObjectId(academyId);
  }

  if (locationId) {
    validateObjectId(locationId, "Location Id");
    match.locationId = new mongoose.Types.ObjectId(locationId);
  }

  if (typeof isActive !== "undefined") {
    match.isActive = isActive === "true" || isActive === true;
  }

  if (name) match.name = { $regex: new RegExp(name, "i") };

  if (search) {
    match.$or = [
      { name: { $regex: new RegExp(search, "i") } },
      { description: { $regex: new RegExp(search, "i") } },
    ];
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

  pipeline.push({
    $project: {
      locationId: 1,
      academyId: 1,
      name: 1,
      description: 1,
      image: 1,
      isActive: 1,
      isDeleted: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  const sortStage = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });

  return await pagination(Venue, pipeline, page, limit);
};
