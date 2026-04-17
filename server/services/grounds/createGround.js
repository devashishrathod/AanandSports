const Ground = require("../../models/Ground");
const Academy = require("../../models/Academy");
const Venue = require("../../models/Venue");
const Sport = require("../../models/Sport");
const Banner = require("../../models/Banner");
const { throwError, validateObjectId } = require("../../utils");
const { uploadImage } = require("../uploads");

const normalizeFilesToArray = (maybeFiles) => {
  if (!maybeFiles) return [];
  if (Array.isArray(maybeFiles)) return maybeFiles;
  return [maybeFiles];
};

exports.createGround = async (payload, bannersFiles) => {
  let {
    name,
    description,
    venueId,
    sportId,
    sports,
    type,
    openingTime,
    closingTime,
    pricePerHour,
    status,
    isActive,
    academyId,
  } = payload;

  validateObjectId(academyId, "Academy Id");
  const academy = await Academy.findById(academyId);
  if (!academy || academy.isDeleted) throwError(404, "Academy not found!");

  validateObjectId(venueId, "Venue Id");
  const venue = await Venue.findById(venueId);
  if (!venue || venue.isDeleted) throwError(404, "Venue not found!");

  const finalSports =
    Array.isArray(sports) && sports.length ? sports : sportId ? [sportId] : [];
  if (!finalSports.length) throwError(422, "Sport Id is required");

  for (const sId of finalSports) {
    validateObjectId(sId, "Sport Id");
    const sport = await Sport.findById(sId);
    if (!sport || sport.isDeleted) throwError(404, "Sport not found!");
  }

  name = name?.toLowerCase();
  description = description?.toLowerCase();

  const existing = await Ground.findOne({
    academyId,
    venueId,
    name,
    isDeleted: false,
  });
  if (existing) throwError(400, "Ground already exist with this name");

  const ground = await Ground.create({
    name,
    description,
    academyId,
    venueId,
    sports: Array.from(new Set(finalSports.map(String))).map((x) => x),
    sportsMeta: Array.from(new Set(finalSports.map(String))).map((sId) => ({
      sportId: sId,
      noOfCourts: 0,
    })),
    type: type?.toLowerCase(),
    openingTime,
    closingTime,
    pricePerHour,
    status,
    isActive,
  });

  const bannersArray = normalizeFilesToArray(bannersFiles);
  if (bannersArray.length) {
    const bannerIds = [];
    for (let i = 0; i < bannersArray.length; i++) {
      const file = bannersArray[i];
      const imageUrl = await uploadImage(file.tempFilePath);
      const banner = await Banner.create({
        name: `${ground.name}-banner-${Date.now()}-${i}`,
        description: "",
        groundId: ground._id,
        image: imageUrl,
        isActive: true,
      });
      bannerIds.push(banner._id);
    }
    ground.banners = bannerIds;
    ground.updatedAt = new Date();
    await ground.save();
  }

  return await Ground.findById(ground._id)
    .populate({ path: "venueId", select: "name description image" })
    .populate({ path: "sports", select: "name description image" })
    .populate({ path: "academyId", select: "name description image" })
    .populate({
      path: "banners",
      select: "name description image video isActive",
    });
};
