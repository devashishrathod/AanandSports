const TimeSlot = require("../../models/TimeSlot");
const { throwError, validateObjectId } = require("../../utils");

const calcDurationHours = (start, end) => {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  return ms / (60 * 60 * 1000);
};

exports.updateSportGroundTimeSlot = async (id, payload = 0) => {
  validateObjectId(id, "TimeSlot Id");

  const slot = await TimeSlot.findById(id);
  if (!slot || slot.isDeleted) throwError(404, "Time slot not found");

  const now = new Date();
  if (slot.startDateTime.getTime() < now.getTime()) {
    throwError(400, "Past time slots cannot be updated");
  }

  if (payload) {
    let { startDateTime, endDateTime, isAvailable, isFull, isActive } = payload;

    if (startDateTime) {
      const d = new Date(startDateTime);
      if (isNaN(d.getTime())) throwError(422, "Invalid startDateTime");
      if (d.getTime() < now.getTime()) throwError(400, "Past time slots are not allowed");
      slot.startDateTime = d;
    }

    if (endDateTime) {
      const d = new Date(endDateTime);
      if (isNaN(d.getTime())) throwError(422, "Invalid endDateTime");
      slot.endDateTime = d;
    }

    if (slot.endDateTime.getTime() <= slot.startDateTime.getTime()) {
      throwError(422, "endDateTime must be greater than startDateTime");
    }

    const duration = calcDurationHours(slot.startDateTime, slot.endDateTime);
    if (!duration || duration <= 0) throwError(422, "Invalid sportDurationInHours");
    slot.sportDurationInHours = duration;

    if (typeof isAvailable !== "undefined") slot.isAvailable = !slot.isAvailable;
    if (typeof isFull !== "undefined") slot.isFull = !slot.isFull;
    if (typeof isActive !== "undefined") slot.isActive = !slot.isActive;
  }

  slot.updatedAt = new Date();
  await slot.save();
  return slot.toObject();
};
