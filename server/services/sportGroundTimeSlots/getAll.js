const mongoose = require("mongoose");
const TimeSlot = require("../../models/TimeSlot");
const SportGround = require("../../models/SportGround");
const {
  throwError,
  validateObjectId,
  parseIsoDateOnly,
  pagination,
} = require("../../utils");

exports.getAllSportGroundTimeSlots = async (query) => {
  let {
    sportGroundId,
    sportDate,
    fromDate,
    toDate,
    isActive,
    isAvailable,
    page,
    limit,
  } = query;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const match = { isDeleted: false };

  if (sportGroundId) {
    validateObjectId(sportGroundId, "SportGround Id");
    const sportGround = await SportGround.findById(sportGroundId);
    if (!sportGround || sportGround.isDeleted)
      throwError(404, "Sport ground not found");
    match.sportGroundId = new mongoose.Types.ObjectId(sportGroundId);
  }

  if (typeof isActive !== "undefined") {
    match.isActive = isActive === "true" || isActive === true;
  }
  if (typeof isAvailable !== "undefined") {
    match.isAvailable = isAvailable === "true" || isAvailable === true;
  }

  if (sportDate) {
    const sd = parseIsoDateOnly(String(sportDate), "sportDate");
    const startOfDay = new Date(sd);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sd);
    endOfDay.setHours(23, 59, 59, 999);
    match.startDateTime = { $gte: startOfDay, $lte: endOfDay };
  } else if (fromDate || toDate) {
    match.startDateTime = {};
    if (fromDate) {
      const fd = parseIsoDateOnly(String(fromDate), "fromDate");
      fd.setHours(0, 0, 0, 0);
      match.startDateTime.$gte = fd;
    }
    if (toDate) {
      const td = parseIsoDateOnly(String(toDate), "toDate");
      td.setHours(23, 59, 59, 999);
      match.startDateTime.$lte = td;
    }
  }

  const pipeline = [{ $match: match }, { $sort: { startDateTime: 1 } }];

  const result = await pagination(TimeSlot, pipeline, page, limit);

  await TimeSlot.populate(result.data, [
    {
      path: "sportGroundId",
      populate: [
        { path: "sportId" },
        { path: "categoryId" },
        { path: "academyId" },
      ],
    },
  ]);

  return result;
};
