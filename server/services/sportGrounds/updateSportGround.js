const SportGround = require("../../models/SportGround");
const Sport = require("../../models/Sport");
const Category = require("../../models/Category");
const { throwError, validateObjectId } = require("../../utils");
const { uploadImage, deleteImage } = require("../uploads");

exports.updateSportGround = async (id, payload = 0, image) => {
  validateObjectId(id, "SportGround Id");
  const sportGround = await SportGround.findById(id);
  if (!sportGround || sportGround.isDeleted) {
    throwError(404, "Sport ground not found");
  }

  if (payload) {
    let {
      sportId,
      categoryId,
      name,
      description,
      coach,
      price,
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

    if (sportId) {
      validateObjectId(sportId, "Sport Id");
      const sport = await Sport.findById(sportId);
      if (!sport || sport.isDeleted) throwError(404, "Sport not found!");
      sportGround.sportId = sportId;
    }

    if (categoryId) {
      validateObjectId(categoryId, "Category Id");
      const category = await Category.findById(categoryId);
      if (!category || category.isDeleted)
        throwError(404, "Category not found!");
      sportGround.categoryId = categoryId;
    }

    if (name) {
      name = name.toLowerCase();
      sportGround.name = name;
    }

    if (typeof isActive !== "undefined") {
      sportGround.isActive = !sportGround.isActive;
    }

    if (typeof isAvailable !== "undefined") {
      sportGround.isAvailable = !sportGround.isAvailable;
    }

    if (typeof isPrivate !== "undefined") {
      sportGround.isPrivate = !sportGround.isPrivate;
    }

    if (typeof isFull !== "undefined") {
      sportGround.isFull = !sportGround.isFull;
    }

    if (price !== undefined) sportGround.price = price;
    if (description) sportGround.description = description?.toLowerCase() || "";
    if (coach) sportGround.coach = coach?.toLowerCase() || "";
    if (openingTime) sportGround.openingTime = openingTime;
    if (closingTime) sportGround.closingTime = closingTime;
    if (level) sportGround.level = level;

    if (typeof maxPlayers !== "undefined") sportGround.maxPlayers = maxPlayers;
    if (typeof minPlayers !== "undefined") sportGround.minPlayers = minPlayers;
    if (typeof maxTeams !== "undefined") sportGround.maxTeams = maxTeams;
    if (typeof minTeams !== "undefined") sportGround.minTeams = minTeams;

    if (features) sportGround.features = features;
  }

  if (image) {
    if (sportGround.image) await deleteImage(sportGround.image);
    const imageUrl = await uploadImage(image.tempFilePath);
    sportGround.image = imageUrl;
  }

  sportGround.updatedAt = new Date();
  await sportGround.save();

  return sportGround.toObject();
};
