const Court = require("../../models/Court");
const Ground = require("../../models/Ground");
const mongoose = require("mongoose");
const { validateObjectId } = require("../../utils");

exports.syncGroundNoOfCourts = async (groundId, sportId) => {
  validateObjectId(groundId, "Ground Id");
  if (sportId) validateObjectId(sportId, "Sport Id");

  const totalCount = await Court.countDocuments({ groundId, isDeleted: false });

  const grouped = await Court.aggregate([
    {
      $match: {
        groundId: new mongoose.Types.ObjectId(groundId),
        isDeleted: false,
      },
    },
    { $group: { _id: "$sportId", count: { $sum: 1 } } },
  ]);

  const countBySport = new Map(grouped.map((g) => [String(g._id), g.count]));

  const ground = await Ground.findById(groundId);
  if (ground && !ground.isDeleted) {
    const meta = Array.isArray(ground.sportsMeta) ? ground.sportsMeta : [];
    ground.sportsMeta = meta.map((m) => {
      const c = countBySport.get(String(m.sportId)) || 0;
      return { sportId: m.sportId, noOfCourts: c };
    });
    ground.noOfCourts = totalCount;
    ground.updatedAt = new Date();
    await ground.save();
  }

  return sportId ? countBySport.get(String(sportId)) || 0 : totalCount;
};
