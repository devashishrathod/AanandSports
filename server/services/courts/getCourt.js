const Court = require("../../models/Court");
const { throwError, validateObjectId } = require("../../utils");

exports.getCourt = async (id) => {
  validateObjectId(id, "Court Id");

  const court = await Court.findById(id)
    .populate({ path: "sportId", select: "name description image" })
    .populate({
      path: "groundId",
      select:
        "name type noOfCourts openingTime closingTime pricePerHour status",
      populate: [
        { path: "venueId", select: "name description image" },
        { path: "sports", select: "name description image" },
        { path: "academyId", select: "name description image" },
        { path: "banners", select: "name description image video isActive" },
      ],
    })
    .select("-isDeleted");

  if (!court || court.isDeleted) throwError(404, "Court not found");
  return court;
};
