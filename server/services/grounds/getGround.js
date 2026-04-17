const Ground = require("../../models/Ground");
const { throwError, validateObjectId } = require("../../utils");

exports.getGround = async (id) => {
  validateObjectId(id, "Ground Id");

  const ground = await Ground.findById(id)
    .populate({ path: "venueId", select: "name description image" })
    .populate({ path: "sports", select: "name description image" })
    .populate({ path: "academyId", select: "name description image" })
    .populate({
      path: "banners",
      select: "name description image video isActive",
    })
    .select("-isDeleted");

  if (!ground || ground.isDeleted) throwError(404, "Ground not found");
  return ground;
};
