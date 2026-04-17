const Court = require("../../models/Court");
const Ground = require("../../models/Ground");
const Sport = require("../../models/Sport");
const { throwError, validateObjectId } = require("../../utils");
const { syncGroundNoOfCourts } = require("./syncGroundNoOfCourts");

exports.createCourt = async (payload) => {
  let { name, description, groundId, sportId, pricePerHour, status, isActive } =
    payload;

  validateObjectId(groundId, "Ground Id");
  const ground = await Ground.findById(groundId);
  if (!ground || ground.isDeleted) throwError(404, "Ground not found");

  validateObjectId(sportId, "Sport Id");
  const sport = await Sport.findById(sportId);
  if (!sport || sport.isDeleted) throwError(404, "Sport not found");

  const groundSports = Array.isArray(ground.sports)
    ? ground.sports.map(String)
    : [];
  if (!groundSports.includes(String(sportId))) {
    throwError(400, "This sport is not linked to this ground");
  }

  name = name?.toLowerCase();
  description = description?.toLowerCase();

  const existing = await Court.findOne({
    groundId,
    sportId,
    name,
    isDeleted: false,
  });
  if (existing) throwError(400, "Court already exist with this name");

  const created = await Court.create({
    name,
    description,
    groundId,
    sportId,
    pricePerHour,
    status,
    isActive,
  });

  await syncGroundNoOfCourts(groundId, sportId);

  return await Court.findById(created._id)
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
};
