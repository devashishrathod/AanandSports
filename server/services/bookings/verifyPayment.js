const Booking = require("../../models/Booking");
const Transaction = require("../../models/Transaction");
const { throwError } = require("../../utils");
const {
  verifyRazorpaySignature,
} = require("../../helpers/payments/verifyRazorpaySignature");

exports.verifyBookingPayment = async (payload) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    payload;

  verifyRazorpaySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  const tx = await Transaction.findOne({
    razorpayOrderId: razorpay_order_id,
    transactionType: "BOOKING",
  });
  if (!tx) throwError(404, "Transaction not found");

  const booking = await Booking.findById(tx.bookingId);
  if (!booking) throwError(404, "Booking not found");

  if (booking.paymentStatus === "paid") return;

  booking.paymentStatus = "paid";
  booking.paymentId = razorpay_payment_id;
  booking.updatedAt = new Date();
  await booking.save();

  tx.razorpayPaymentId = razorpay_payment_id;
  tx.razorpaySignature = razorpay_signature;
  tx.status = "SUCCESS";
  tx.rawResponse = {
    ...(tx.rawResponse || {}),
    verifiedAt: new Date(),
  };
  await tx.save();

  return;
};
