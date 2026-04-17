const Court = require("../../models/Court");
const { throwError, validateObjectId } = require("../../utils");
const { syncGroundNoOfCourts } = require("./syncGroundNoOfCourts");

exports.deleteCourt = async (id) => {
  validateObjectId(id, "Court Id");
  const court = await Court.findById(id);
  if (!court || court.isDeleted) throwError(404, "Court not found");

  const groundId = String(court.groundId);
  const sportId = String(court.sportId);

  court.isDeleted = true;
  court.isActive = false;
  court.updatedAt = new Date();
  await court.save();

  await syncGroundNoOfCourts(groundId, sportId);
  return;
};
