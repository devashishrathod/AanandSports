const { create } = require("./create");
const { getAll } = require("./getAll");
const { get } = require("./get");
const { update } = require("./update");
const { deleteBooking } = require("./delete");
const { initiatePayment } = require("./initiatePayment");
const { verifyPayment } = require("./verifyPayment");

module.exports = {
  create,
  getAll,
  get,
  update,
  deleteBooking,
  initiatePayment,
  verifyPayment,
};
