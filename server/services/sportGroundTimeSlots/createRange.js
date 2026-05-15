const mongoose = require("mongoose");

const TimeSlot = require("../../models/TimeSlot");
const SportGround = require("../../models/SportGround");
const {
  throwError,
  validateObjectId,
  parseIsoDateOnly,
  parseTimeToDate,
} = require("../../utils");

const enumerateDatesInclusive = (startDate, endDate) => {
  const out = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  while (cursor.getTime() <= end.getTime()) {
    out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
};

const calcDurationHours = (start, end) => {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  return ms / (60 * 60 * 1000);
};

exports.createSportGroundTimeSlotRange = async (payload) => {
  const { sportGroundId, startDate, endDate, timeSlots } = payload;

  validateObjectId(sportGroundId, "SportGround Id");

  const sportGround = await SportGround.findById(sportGroundId);
  if (!sportGround || sportGround.isDeleted) {
    throwError(404, "Sport ground not found");
  }

  const startD = parseIsoDateOnly(String(startDate), "startDate");
  const endD = parseIsoDateOnly(String(endDate), "endDate");
  if (endD.getTime() < startD.getTime()) {
    throwError(422, "endDate must be greater than or equal to startDate");
  }

  const dates = enumerateDatesInclusive(startD, endD);
  const now = new Date();

  const docs = [];
  for (const d of dates) {
    for (const w of timeSlots || []) {
      const start = parseTimeToDate(String(w.startTime), d, "startTime");
      const end = parseTimeToDate(String(w.endTime), d, "endTime");

      if (end.getTime() <= start.getTime()) {
        throwError(422, "endTime must be greater than startTime");
      }
      if (start.getTime() < now.getTime()) {
        throwError(400, "Past time slots are not allowed");
      }

      const duration = calcDurationHours(start, end);
      if (!duration || duration <= 0) {
        throwError(422, "Invalid sportDurationInHours");
      }

      docs.push({
        sportGroundId: new mongoose.Types.ObjectId(sportGroundId),
        academyId: sportGround.academyId,
        sportId: sportGround.sportId,
        categoryId: sportGround.categoryId,
        startDateTime: start,
        endDateTime: end,
        sportDurationInHours: duration,
        isAvailable: true,
        isFull: false,
        isActive: true,
        isDeleted: false,
      });
    }
  }

  if (!docs.length) throwError(422, "No time slots to create");

  const created = [];
  const skipped = [];

  for (const doc of docs) {
    try {
      const x = await TimeSlot.create(doc);
      created.push(x);
    } catch (e) {
      if (e && e.code === 11000) {
        skipped.push({
          sportGroundId: String(doc.sportGroundId),
          startDateTime: doc.startDateTime,
          endDateTime: doc.endDateTime,
        });
        continue;
      }
      throw e;
    }
  }

  return {
    sportGroundId,
    createdCount: created.length,
    skippedCount: skipped.length,
    created,
    skipped,
  };
};
