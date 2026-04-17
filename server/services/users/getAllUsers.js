const mongoose = require("mongoose");
const User = require("../../models/User");
const { pagination, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");

exports.getAllUsers = async (query) => {
  let {
    page,
    limit,
    search,
    name,
    email,
    mobile,
    address,
    role,
    academyId,
    isActive,
    fromDate,
    toDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const match = { isDeleted: false };

  // default behavior: return only users (not admin)
  // If role passed explicitly, use it; otherwise force USER
  if (role) {
    match.role = role;
  } else {
    match.role = ROLES.USER;
  }

  // Always exclude admin (even if role filter is used)
  match.role = match.role ? match.role : { $ne: ROLES.ADMIN };
  if (match.role === ROLES.ADMIN) {
    match.role = { $ne: ROLES.ADMIN };
  }

  if (academyId) {
    validateObjectId(academyId, "Academy Id");
    match.academyId = new mongoose.Types.ObjectId(academyId);
  }

  if (typeof isActive !== "undefined") {
    match.isActive = isActive === "true" || isActive === true;
  }

  if (name) match.name = { $regex: new RegExp(name, "i") };
  if (email) match.email = { $regex: new RegExp(email, "i") };
  if (mobile) match.mobile = { $regex: new RegExp(mobile, "i") };
  if (address) match.address = { $regex: new RegExp(address, "i") };

  if (search) {
    match.$or = [
      { name: { $regex: new RegExp(search, "i") } },
      { email: { $regex: new RegExp(search, "i") } },
      { mobile: { $regex: new RegExp(search, "i") } },
      { address: { $regex: new RegExp(search, "i") } },
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
    $lookup: {
      from: "academies",
      localField: "academyId",
      foreignField: "_id",
      as: "academy",
    },
  });
  pipeline.push({
    $unwind: { path: "$academy", preserveNullAndEmptyArrays: true },
  });

  pipeline.push({
    $project: {
      password: 0,
      otp: 0,
      isDeleted: 0,
      "academy.isDeleted": 0,
    },
  });

  const sortStage = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });

  return await pagination(User, pipeline, page, limit);
};
