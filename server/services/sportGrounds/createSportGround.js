const SportGround = require("../../models/SportGround");
const Academy = require("../../models/Academy");
const Sport = require("../../models/Sport");
const Category = require("../../models/Category");
const { throwError, validateObjectId } = require("../../utils");
const { uploadImage } = require("../uploads");

exports.createSportGround = async (payload, image) => {
  let {
    academyId,
    sportId,
    categoryId,
    name,
    description,
    price,
    coach,
    openingTime,
    closingTime,
    level,
    maxPlayers,
    minPlayers,
    maxTeams,
    minTeams,
    features,
    isPrivate,
    isAvailable,
    isFull,
    isActive,
  } = payload;

  validateObjectId(sportId, "Sport Id");
  validateObjectId(categoryId, "Category Id");
  validateObjectId(academyId, "Academy Id");

  const academy = await Academy.findById(academyId);
  if (!academy || academy.isDeleted) throwError(404, "Academy not found!");

  const sport = await Sport.findById(sportId);
  if (!sport || sport.isDeleted) throwError(404, "Sport not found!");

  const category = await Category.findById(categoryId);
  if (!category || category.isDeleted) throwError(404, "Category not found!");

  name = name?.toLowerCase();
  description = description?.toLowerCase();
  coach = coach?.toLowerCase();

  // const existing = await SportGround.findOne({
  //   venueId,
  //   name,
  //   isDeleted: false,
  // });
  // if (existing) {
  //   throwError(
  //     400,
  //     `Sport ground already exist with this name for ${venue.name}`,
  //   );
  // }

  let imageUrl;
  if (image) imageUrl = await uploadImage(image.tempFilePath);

  const created = await SportGround.create({
    academyId,
    sportId,
    categoryId,
    name,
    description,
    price,
    coach,
    openingTime,
    closingTime,
    level,
    maxPlayers,
    minPlayers,
    maxTeams,
    minTeams,
    features,
    isPrivate,
    isAvailable,
    isFull,
    image: imageUrl,
    isActive,
  });
  return created.toObject();
};
