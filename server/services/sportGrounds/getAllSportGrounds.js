const mongoose = require("mongoose");
const User = require("../../models/User");
const SportGround = require("../../models/SportGround");
const TimeSlot = require("../../models/TimeSlot");
const { ROLES } = require("../../constants");
const {
  pagination,
  throwError,
  validateObjectId,
  parseIsoDateOnly,
} = require("../../utils");

exports.getAllSportGrounds = async (userId, query) => {
  let {
    page,
    limit,
    search,
    name,
    description,
    price,
    coach,
    level,
    openingTime,
    closingTime,
    academyId,
    sportId,
    categoryId,
    isActive,
    isAvailable,
    isPrivate,
    isFull,
    maxPlayers,
    minPlayers,
    maxTeams,
    minTeams,
    fromSlotDate,
    toSlotDate,
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
  if (sportId) {
    validateObjectId(sportId, "Sport Id");
    match.sportId = new mongoose.Types.ObjectId(sportId);
  }
  if (categoryId) {
    validateObjectId(categoryId, "Category Id");
    match.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  if (typeof isActive !== "undefined") {
    match.isActive = isActive === "true" || isActive === true;
  }
  if (typeof isAvailable !== "undefined") {
    match.isAvailable = isAvailable === "true" || isAvailable === true;
  }
  if (typeof isPrivate !== "undefined") {
    match.isPrivate = isPrivate === "true" || isPrivate === true;
  }
  if (typeof isFull !== "undefined") {
    match.isFull = isFull === "true" || isFull === true;
  }

  if (price !== undefined) match.price = Number(price);
  if (typeof maxPlayers !== "undefined") match.maxPlayers = Number(maxPlayers);
  if (typeof minPlayers !== "undefined") match.minPlayers = Number(minPlayers);
  if (typeof maxTeams !== "undefined") match.maxTeams = Number(maxTeams);
  if (typeof minTeams !== "undefined") match.minTeams = Number(minTeams);

  if (name) match.name = { $regex: new RegExp(name, "i") };

  if (search) {
    match.$or = [
      { name: { $regex: new RegExp(search, "i") } },
      { description: { $regex: new RegExp(search, "i") } },
      { coach: { $regex: new RegExp(search, "i") } },
    ];
  }

  if (description) match.description = { $regex: new RegExp(description, "i") };
  if (coach) match.coach = { $regex: new RegExp(coach, "i") };
  if (level) match.level = level;
  if (openingTime) match.openingTime = { $regex: new RegExp(openingTime, "i") };
  if (closingTime) match.closingTime = { $regex: new RegExp(closingTime, "i") };

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
      academyId: 1,
      sportId: 1,
      categoryId: 1,
      name: 1,
      description: 1,
      price: 1,
      coach: 1,
      openingTime: 1,
      closingTime: 1,
      level: 1,
      maxPlayers: 1,
      minPlayers: 1,
      maxTeams: 1,
      minTeams: 1,
      features: 1,
      isPrivate: 1,
      isAvailable: 1,
      isFull: 1,
      image: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  const sortStage = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });

  const result = await pagination(SportGround, pipeline, page, limit);
  // Populate after aggregation
  await SportGround.populate(result.data, [
    { path: "academyId", select: "name description image" },
    { path: "sportId", select: "name description image" },
    { path: "categoryId", select: "name description image" },
  ]);

  const grounds = result.data || [];

  if (fromSlotDate || toSlotDate) {
    const slotMatch = { isDeleted: false };
    if (fromSlotDate || toSlotDate) {
      slotMatch.startDateTime = {};
      if (fromSlotDate) {
        const fd = parseIsoDateOnly(String(fromSlotDate), "fromSlotDate");
        fd.setHours(0, 0, 0, 0);
        slotMatch.startDateTime.$gte = fd;
      }
      if (toSlotDate) {
        const td = parseIsoDateOnly(String(toSlotDate), "toSlotDate");
        td.setHours(23, 59, 59, 999);
        slotMatch.startDateTime.$lte = td;
      }
    }

    const groundIds = grounds.map((g) => new mongoose.Types.ObjectId(g._id));
    if (groundIds.length) {
      slotMatch.sportGroundId = { $in: groundIds };
      const slots = await TimeSlot.find(slotMatch)
        .select(
          "sportGroundId startDateTime endDateTime sportDurationInHours isAvailable isFull isActive",
        )
        .sort({ startDateTime: 1 })
        .lean();

      const byGround = new Map();
      for (const s of slots) {
        const key = String(s.sportGroundId);
        if (!byGround.has(key)) byGround.set(key, []);
        byGround.get(key).push(s);
      }

      result.data = grounds
        .map((g) => ({ ...g, timeSlots: byGround.get(String(g._id)) || [] }))
        .filter((g) => (g.timeSlots || []).length > 0);

      result.total = result.data.length;
    }
  }

  return result;
};
