const { createBooking } = require("./createBooking");
const { getAllBookings } = require("./getAllBookings");
const { getBooking } = require("./getBooking");
const { updateBooking } = require("./updateBooking");
const { deleteBooking } = require("./deleteBooking");

module.exports = {
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
};
