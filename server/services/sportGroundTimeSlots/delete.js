const TimeSlot = require("../../models/TimeSlot");
const { throwError, validateObjectId } = require("../../utils");

exports.deleteSportGroundTimeSlot = async (id) => {
  validateObjectId(id, "TimeSlot Id");

  const slot = await TimeSlot.findById(id);
  if (!slot || slot.isDeleted) throwError(404, "Time slot not found");

  const now = new Date();
  if (slot.startDateTime.getTime() < now.getTime()) {
    throwError(400, "Past time slots cannot be deleted");
  }

  slot.isDeleted = true;
  slot.updatedAt = new Date();
  await slot.save();
  return { success: true };
};
