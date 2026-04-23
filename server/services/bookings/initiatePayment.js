const razorpay = require("../../configs/razorpay");
const Booking = require("../../models/Booking");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");
const { splitAmount } = require("../../helpers/payments/splitAmount");

exports.initiateBookingPayment = async (bookingId, tokenUserId) => {
  const user = await User.findById(tokenUserId);
  if (!user) throwError(404, "User not found");

  validateObjectId(bookingId, "Booking Id");
  const booking = await Booking.findById(bookingId);
  if (!booking) throwError(404, "Booking not found");

  const isAdmin = user.role === ROLES.ADMIN;
  if (!isAdmin) {
    if (String(booking.userId) !== String(user._id))
      throwError(403, "Forbidden");
  }

  if (booking.paymentStatus === "paid") {
    return {
      bookingId: booking._id,
      razorpayOrderId: booking.razorpayOrderId,
      amount: booking.price || 0,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  const amount = Number(booking.price || 0);
  if (!amount || amount <= 0)
    throwError(422, "Booking price is required for payment");

  const { academyAmount, platformAmount } = splitAmount(amount);

  const existingTx = await Transaction.findOne({
    bookingId: booking._id,
    transactionType: "BOOKING",
    status: "PENDING",
  });

  if (existingTx && existingTx.razorpayOrderId) {
    booking.razorpayOrderId = existingTx.razorpayOrderId;
    booking.academyAmount = academyAmount;
    booking.platformAmount = platformAmount;
    booking.updatedAt = new Date();
    await booking.save();

    return {
      bookingId: booking._id,
      razorpayOrderId: existingTx.razorpayOrderId,
      amount,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  const rpOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `booking_${booking._id}`,
  });

  booking.razorpayOrderId = rpOrder.id;
  booking.academyAmount = academyAmount;
  booking.platformAmount = platformAmount;
  booking.updatedAt = new Date();
  await booking.save();

  await Transaction.create({
    bookingId: booking._id,
    transactionType: "BOOKING",
    gateway: "RAZORPAY",
    razorpayOrderId: rpOrder.id,
    amount,
    academyAmount,
    platformAmount,
    rawResponse: rpOrder,
  });

  return {
    bookingId: booking._id,
    razorpayOrderId: rpOrder.id,
    amount,
    key: process.env.RAZORPAY_KEY_ID,
  };
};
