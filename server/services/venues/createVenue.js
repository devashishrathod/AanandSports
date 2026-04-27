const Venue = require("../../models/Venue");
const Academy = require("../../models/Academy");
const User = require("../../models/User");
const Location = require("../../models/Location");
const { throwError, validateObjectId } = require("../../utils");
const { uploadImage } = require("../uploads");
const { ROLES } = require("../../constants");

exports.createVenue = async (payload, image) => {
  let { academyId, locationId, name, description, isActive } = payload;

  if (academyId) {
    validateObjectId(academyId, "Academy Id");
    const academy = await Academy.findById(academyId);
    if (!academy || academy.isDeleted) throwError(404, "Academy not found!");
  }

  validateObjectId(locationId, "Location Id");
  const location = await Location.findById(locationId);
  if (!location || location.isDeleted) throwError(404, "Location not found!");

  const user = await User.findById(location?.userId);
  if (!user || user.isDeleted) {
    throwError(404, "Unauthorized user! User not found");
  }
  const isAcademyManager = user?.role === ROLES.ACADEMY_MANAGER;
  if (isAcademyManager) academyId = user.academyId;

  name = name?.toLowerCase();
  description = description?.toLowerCase();

  const existingVenue = await Venue.findOne({
    locationId,
    name,
    isDeleted: false,
  });
  if (existingVenue) {
    throwError(400, `Venue already exist with this name for ${location.name}`);
  }

  let imageUrl;
  if (image) imageUrl = await uploadImage(image.tempFilePath);

  return await Venue.create({
    locationId,
    academyId,
    name,
    description,
    image: imageUrl,
    isActive,
  });
};
