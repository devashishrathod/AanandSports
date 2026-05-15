const { createSportGroundTimeSlotRange } = require("./createRange");
const { getAllSportGroundTimeSlots } = require("./getAll");
const { updateSportGroundTimeSlot } = require("./update");
const { deleteSportGroundTimeSlot } = require("./delete");

module.exports = {
  createSportGroundTimeSlotRange,
  getAllSportGroundTimeSlots,
  updateSportGroundTimeSlot,
  deleteSportGroundTimeSlot,
};
