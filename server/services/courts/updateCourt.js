const Court = require("../../models/Court");
const Ground = require("../../models/Ground");
const Sport = require("../../models/Sport");
const { throwError, validateObjectId } = require("../../utils");
const { syncGroundNoOfCourts } = require("./syncGroundNoOfCourts");

exports.updateCourt = async (id, payload = 0) => {
  validateObjectId(id, "Court Id");
  const court = await Court.findById(id);
  if (!court || court.isDeleted) throwError(404, "Court not found");

  const oldGroundId = String(court.groundId);
  const oldSportId = String(court.sportId);

  if (payload) {
    let {
      name,
      description,
      groundId,
      sportId,
      pricePerHour,
      status,
      isActive,
    } = payload;

    if (groundId) {
      validateObjectId(groundId, "Ground Id");
      const ground = await Ground.findById(groundId);
      if (!ground || ground.isDeleted) throwError(404, "Ground not found");
      court.groundId = groundId;
    }

    if (sportId) {
      validateObjectId(sportId, "Sport Id");
      const sport = await Sport.findById(sportId);
      if (!sport || sport.isDeleted) throwError(404, "Sport not found");
      court.sportId = sportId;
    }

    const groundForSportCheck = await Ground.findById(court.groundId);
    if (!groundForSportCheck || groundForSportCheck.isDeleted)
      throwError(404, "Ground not found");
    const gSports = Array.isArray(groundForSportCheck.sports)
      ? groundForSportCheck.sports.map(String)
      : [];
    if (!gSports.includes(String(court.sportId))) {
      throwError(400, "This sport is not linked to this ground");
    }

    if (name) {
      name = name.toLowerCase();
      const existing = await Court.findOne({
        _id: { $ne: id },
        groundId: court.groundId,
        sportId: court.sportId,
        name,
        isDeleted: false,
      });
      if (existing) throwError(400, "Another court exists with this name");
      court.name = name;
    }

    if (typeof isActive !== "undefined") {
      court.isActive = !court.isActive;
    }

    if (description) court.description = description?.toLowerCase() || "";
    if (typeof pricePerHour !== "undefined") court.pricePerHour = pricePerHour;
    if (status) court.status = status;
  }

  court.updatedAt = new Date();
  await court.save();

  const newGroundId = String(court.groundId);
  const newSportId = String(court.sportId);
  await syncGroundNoOfCourts(newGroundId, newSportId);
  if (oldGroundId !== newGroundId)
    await syncGroundNoOfCourts(oldGroundId, oldSportId);
  if (oldSportId !== newSportId)
    await syncGroundNoOfCourts(newGroundId, oldSportId);

  return await Court.findById(id)
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
