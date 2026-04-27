const mongoose = require("mongoose");
const User = require("../../models/User");
const SportGround = require("../../models/SportGround");
const { ROLES } = require("../../constants");
const {
  pagination,
  validateObjectId,
  formatTimeForUi,
  formatDateTimeForUi,
  parseIsoDateOnly,
  parseTimeToMinutes,
} = require("../../utils");

exports.getAllSportGrounds = async (userId, query) => {
  let {
    page,
    limit,
    search,
    name,
    description,
    coach,
    level,
    openingTime,
    closingTime,
    academyId,
    venueId,
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
    sportDurationInHours,
    sportDate,
    fromSportDate,
    toSportDate,
    sportTime,
    fromSportTime,
    toSportTime,
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

  if (venueId) {
    validateObjectId(venueId, "Venue Id");
    match.venueId = new mongoose.Types.ObjectId(venueId);
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

  if (typeof maxPlayers !== "undefined") match.maxPlayers = Number(maxPlayers);
  if (typeof minPlayers !== "undefined") match.minPlayers = Number(minPlayers);
  if (typeof maxTeams !== "undefined") match.maxTeams = Number(maxTeams);
  if (typeof minTeams !== "undefined") match.minTeams = Number(minTeams);
  if (typeof sportDurationInHours !== "undefined") {
    match.sportDurationInHours = Number(sportDurationInHours);
  }

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

  // Exact sportDate filter (date-only match; time ignored)
  if (sportDate) {
    const sdStart = parseIsoDateOnly(String(sportDate), "sportDate");
    sdStart.setHours(0, 0, 0, 0);
    const sdEnd = new Date(sdStart);
    sdEnd.setHours(23, 59, 59, 999);
    match.sportDate = { $gte: sdStart, $lte: sdEnd };
  }
  // sportDate filtering (date-only match: time ignored)
  if (fromSportDate || toSportDate) {
    // If exact sportDate already applied, don't override it.
    if (!match.sportDate || !match.sportDate.$gte)
      match.sportDate = match.sportDate || {};
    if (fromSportDate) {
      const fd = parseIsoDateOnly(String(fromSportDate), "fromSportDate");
      fd.setHours(0, 0, 0, 0);
      match.sportDate.$gte = fd;
    }
    if (toSportDate) {
      const td = parseIsoDateOnly(String(toSportDate), "toSportDate");
      td.setHours(23, 59, 59, 999);
      match.sportDate.$lte = td;
    }
  }

  // Time-of-day filtering based on sportTiming regardless of date
  // Converts sportTiming -> minutes of day in pipeline.
  const hasTimeFilter = sportTime || fromSportTime || toSportTime;

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

  if (hasTimeFilter) {
    pipeline.push({
      $addFields: {
        __sportTimeMinutes: {
          $add: [
            { $multiply: [{ $hour: "$sportTiming" }, 60] },
            { $minute: "$sportTiming" },
          ],
        },
      },
    });

    const timeMatch = {};
    if (sportTime) {
      timeMatch.__sportTimeMinutes = parseTimeToMinutes(
        String(sportTime),
        "sportTime",
      );
    } else {
      if (fromSportTime || toSportTime) {
        timeMatch.__sportTimeMinutes = {};
        if (fromSportTime) {
          timeMatch.__sportTimeMinutes.$gte = parseTimeToMinutes(
            String(fromSportTime),
            "fromSportTime",
          );
        }
        if (toSportTime) {
          timeMatch.__sportTimeMinutes.$lte = parseTimeToMinutes(
            String(toSportTime),
            "toSportTime",
          );
        }
      }
    }

    pipeline.push({ $match: timeMatch });
  }

  pipeline.push({
    $project: {
      academyId: 1,
      venueId: 1,
      sportId: 1,
      categoryId: 1,
      name: 1,
      description: 1,
      coach: 1,
      openingTime: 1,
      closingTime: 1,
      level: 1,
      sportDurationInHours: 1,
      sportDate: 1,
      sportTiming: 1,
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
    { path: "venueId", select: "name description image" },
    { path: "sportId", select: "name description image" },
    { path: "categoryId", select: "name description image" },
  ]);
  result.data = (result.data || []).map((g) => ({
    ...g,
    sportTimingDisplay: formatTimeForUi(g.sportTiming),
    sportDateDisplay: formatDateTimeForUi(g.sportDate),
  }));

  return result;
};
