const { createBooking } = require("./createBooking");
const { getAllBookings } = require("./getAllBookings");
const { getBooking } = require("./getBooking");
const { updateBooking } = require("./updateBooking");
const { deleteBooking } = require("./deleteBooking");
const { initiateBookingPayment } = require("./initiatePayment");
const { verifyBookingPayment } = require("./verifyPayment");

module.exports = {
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  initiateBookingPayment,
  verifyBookingPayment,
};
