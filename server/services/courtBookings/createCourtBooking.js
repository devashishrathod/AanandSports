const mongoose = require("mongoose");
const User = require("../../models/User");
const Academy = require("../../models/Academy");
const Court = require("../../models/Court");
const CourtSlot = require("../../models/CourtSlot");
const CourtBooking = require("../../models/CourtBooking");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");
const {
  getSlotConfig,
  assertSlotWithinGroundHours,
  assertSportLinkedToGround,
  getGroundOrThrow,
} = require("./helpers");

const buildHourStarts = (start, requiredHours) => {
  const hourStarts = [];
  for (let i = 0; i < requiredHours; i++) {
    hourStarts.push(new Date(start.getTime() + i * 60 * 60 * 1000));
  }
  return hourStarts;
};

exports.createCourtBooking = async (tokenUserId, payload) => {
  const authUser = await User.findById(tokenUserId);
  if (!authUser || authUser.isDeleted) throwError(404, "User not found");

  const { items, paymentStatus, paymentId } = payload;

  // Only logged-in user can book for themselves in this flow
  if (authUser.role !== ROLES.USER && authUser.role !== ROLES.ADMIN) {
    throwError(403, "Forbidden");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const bookingItems = [];
    let totalPrice = 0;

    // Pre-validate all items and build lock docs
    const slotDocs = [];

    for (const it of items) {
      const { courtId, startTime } = it;
      validateObjectId(courtId, "Court Id");

      const court = await Court.findById(courtId).session(session);
      if (!court || court.isDeleted) throwError(404, "Court not found");
      if (!court.isActive) throwError(400, "Court is not active");

      const ground = await getGroundOrThrow(court.groundId);

      const academy = await Academy.findById(ground.academyId);
      if (!academy || academy.isDeleted) throwError(404, "Academy not found");

      assertSportLinkedToGround(ground, court.sportId);

      const { durationMs, requiredHours, durationHours } = await getSlotConfig(
        court.sportId,
      );

      const { start, end } = assertSlotWithinGroundHours(
        ground,
        startTime,
        durationMs,
      );

      const hourStarts = buildHourStarts(start, requiredHours);

      const pricePerHour = Number(court.pricePerHour || 0);
      const price = Math.round(pricePerHour * durationHours);
      totalPrice += price;

      bookingItems.push({
        academyId: academy._id,
        groundId: court.groundId,
        courtId: court._id,
        sportId: court.sportId,
        startTime: start,
        endTime: end,
        slotStarts: hourStarts,
        price,
      });

      for (const hs of hourStarts) {
        slotDocs.push({
          courtId: court._id,
          groundId: court.groundId,
          sportId: court.sportId,
          slotStart: hs,
          isReserved: true,
        });
      }
    }

    // Create booking first, then attach bookingId to slots
    const booking = await CourtBooking.create(
      [
        {
          userId: authUser._id,
          items: bookingItems,
          totalPrice,
          status: "pending",
          paymentStatus: paymentStatus || "pending",
          paymentId: typeof paymentId !== "undefined" ? paymentId : "",
        },
      ],
      { session },
    );

    const createdBooking = booking?.[0];
    if (!createdBooking) throwError(500, "Failed to create booking");

    const docsWithBooking = slotDocs.map((d) => ({
      ...d,
      bookingId: createdBooking._id,
    }));

    try {
      await CourtSlot.insertMany(docsWithBooking, { session, ordered: true });
    } catch (err) {
      // Duplicate key => already reserved
      if (err && (err.code === 11000 || err.code === 11001)) {
        throwError(400, "This slot is already booked");
      }
      throw err;
    }

    await session.commitTransaction();

    const populated = await CourtBooking.findById(createdBooking._id)
      .populate({ path: "userId", select: "name email mobile role" })
      .populate({ path: "items.academyId" })
      .populate({ path: "items.groundId" })
      .populate({ path: "items.courtId" })
      .populate({ path: "items.sportId", select: "name description image" });

    return populated;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};
