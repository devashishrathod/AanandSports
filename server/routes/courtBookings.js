const express = require("express");
const router = express.Router();

const { verifyJwtToken } = require("../middlewares");
const {
  create,
  getAll,
  get,
  update,
  cancel,
  initiatePayment,
  verifyPayment,
} = require("../controllers/courtBookings");

router.post("/create", verifyJwtToken, create);
router.post("/initiate-payment/:id", verifyJwtToken, initiatePayment);
router.post("/verify-payment", verifyJwtToken, verifyPayment);
router.get("/getAll", verifyJwtToken, getAll);
router.get("/get/:id", verifyJwtToken, get);
router.put("/update/:id", verifyJwtToken, update);
router.put("/cancel/:id", verifyJwtToken, cancel);

module.exports = router;
