const mongoose = require("mongoose");
const Ground = require("../../models/Ground");
const { pagination, validateObjectId } = require("../../utils");

exports.getAllGrounds = async (query) => {
  let {
    page,
    limit,
    search,
    name,
    academyId,
    venueId,
    sportId,
    type,
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

  if (academyId) {
    validateObjectId(academyId, "Academy Id");
    match.academyId = new mongoose.Types.ObjectId(academyId);
  }

  if (venueId) {
    validateObjectId(venueId, "Venue Id");
    match.venueId = new mongoose.Types.ObjectId(venueId);
  }

  if (sportId) {
    validateObjectId(sportId, "Sport Id");
    match.sports = new mongoose.Types.ObjectId(sportId);
  }

  if (type) match.type = { $regex: new RegExp(type, "i") };
  if (status) match.status = status;

  if (typeof isActive !== "undefined") {
    match.isActive = isActive === "true" || isActive === true;
  }

  if (name) match.name = { $regex: new RegExp(name, "i") };

  if (search) {
    match.$or = [
      { name: { $regex: new RegExp(search, "i") } },
      { description: { $regex: new RegExp(search, "i") } },
      { type: { $regex: new RegExp(search, "i") } },
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
      venueId: 1,
      sports: 1,
      sportsMeta: 1,
      academyId: 1,
      banners: 1,
      type: 1,
      noOfCourts: 1,
      openingTime: 1,
      closingTime: 1,
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

  const result = await pagination(Ground, pipeline, page, limit);

  const ids = (result.data || []).map((x) => x._id);
  const populated = await Ground.find({ _id: { $in: ids } })
    .populate({ path: "venueId", select: "name description image" })
    .populate({ path: "sports", select: "name description image" })
    .populate({ path: "academyId", select: "name description image" })
    .populate({
      path: "banners",
      select: "name description image video isActive",
    });

  const byId = new Map(populated.map((d) => [String(d._id), d]));
  result.data = (result.data || []).map((d) => byId.get(String(d._id)) || d);

  return result;
};
