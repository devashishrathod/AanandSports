const mongoose = require("mongoose");
const Court = require("../../models/Court");
const { pagination, validateObjectId } = require("../../utils");

exports.getAllCourts = async (query) => {
  let {
    page,
    limit,
    search,
    name,
    groundId,
    sportId,
    status,
    isActive,
    fromDate,
    toDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const match = { isDeleted: false };

  if (groundId) {
    validateObjectId(groundId, "Ground Id");
    match.groundId = new mongoose.Types.ObjectId(groundId);
  }

  if (sportId) {
    validateObjectId(sportId, "Sport Id");
    match.sportId = new mongoose.Types.ObjectId(sportId);
  }

  if (status) match.status = status;

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
      name: 1,
      description: 1,
      groundId: 1,
      sportId: 1,
      pricePerHour: 1,
      status: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  const sortStage = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });

  const result = await pagination(Court, pipeline, page, limit);

  const ids = (result.data || []).map((x) => x._id);
  const populated = await Court.find({ _id: { $in: ids } })
    .populate({ path: "sportId", select: "name description image" })
    .populate({
      path: "groundId",
      select:
        "name type noOfCourts openingTime closingTime pricePerHour status",
      populate: [
        { path: "venueId", select: "name description image" },
        { path: "sports", select: "name description image" },
        { path: "academyId", select: "name description image" },
      ],
    })
    .select("-isDeleted");

  const byId = new Map(populated.map((d) => [String(d._id), d]));
  result.data = (result.data || []).map((d) => byId.get(String(d._id)) || d);

  return result;
};
