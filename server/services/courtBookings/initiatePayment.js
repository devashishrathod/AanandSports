const razorpay = require("../../configs/razorpay");
const CourtBooking = require("../../models/CourtBooking");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const { throwError, validateObjectId } = require("../../utils");
const { ROLES } = require("../../constants");
const { splitAmount } = require("../../helpers/payments/splitAmount");

exports.initiateCourtBookingPayment = async (courtBookingId, tokenUserId) => {
  const user = await User.findById(tokenUserId);
  if (!user) throwError(404, "User not found");

  validateObjectId(courtBookingId, "CourtBooking Id");
  const booking = await CourtBooking.findById(courtBookingId);
  if (!booking) throwError(404, "Court booking not found");

  const isAdmin = user.role === ROLES.ADMIN;
  if (!isAdmin) {
    if (String(booking.userId) !== String(user._id))
      throwError(403, "Forbidden");
  }

  if (booking.paymentStatus === "paid") {
    return {
      courtBookingId: booking._id,
      razorpayOrderId: booking.razorpayOrderId,
      amount: booking.totalPrice || 0,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  const amount = Number(booking.totalPrice || 0);
  if (!amount || amount <= 0)
    throwError(422, "Court booking totalPrice is required for payment");

  // Split total
  const totalSplit = splitAmount(amount);

  // Split per item too
  const items = Array.isArray(booking.items) ? booking.items : [];
  const updatedItems = items.map((it) => {
    const plain = typeof it?.toObject === "function" ? it.toObject() : it;
    const itemPrice = Number(plain?.price || 0);
    if (!itemPrice || itemPrice <= 0) {
      return { ...plain, academyAmount: 0, platformAmount: 0 };
    }

    const s = splitAmount(itemPrice);
    return {
      ...plain,
      academyAmount: s.academyAmount,
      platformAmount: s.platformAmount,
    };
  });

  // Existing pending TX reuse
  const existingTx = await Transaction.findOne({
    courtBookingId: booking._id,
    transactionType: "COURT_BOOKING",
    status: "PENDING",
  });

  if (existingTx && existingTx.razorpayOrderId) {
    booking.razorpayOrderId = existingTx.razorpayOrderId;
    booking.academyAmount = totalSplit.academyAmount;
    booking.platformAmount = totalSplit.platformAmount;
    booking.items = updatedItems;
    booking.updatedAt = new Date();
    await booking.save();

    return {
      courtBookingId: booking._id,
      razorpayOrderId: existingTx.razorpayOrderId,
      amount,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  const rpOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `courtBooking_${booking._id}`,
  });

  booking.razorpayOrderId = rpOrder.id;
  booking.academyAmount = totalSplit.academyAmount;
  booking.platformAmount = totalSplit.platformAmount;
  booking.items = updatedItems;
  booking.updatedAt = new Date();
  await booking.save();

  await Transaction.create({
    courtBookingId: booking._id,
    transactionType: "COURT_BOOKING",
    gateway: "RAZORPAY",
    razorpayOrderId: rpOrder.id,
    amount,
    academyAmount: totalSplit.academyAmount,
    platformAmount: totalSplit.platformAmount,
    rawResponse: rpOrder,
  });

  return {
    courtBookingId: booking._id,
    razorpayOrderId: rpOrder.id,
    amount,
    key: process.env.RAZORPAY_KEY_ID,
  };
};
