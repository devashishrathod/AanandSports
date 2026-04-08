const express = require("express");
const router = express.Router();

const { verifyJwtToken, isAdmin } = require("../middlewares");
const {
  create,
  getAll,
  get,
  update,
  deleteBooking,
} = require("../controllers/bookings");

router.post("/create", verifyJwtToken, create);
router.get("/getAll", verifyJwtToken, getAll);
router.get("/get/:id", verifyJwtToken, get);
router.put("/update/:id", verifyJwtToken, update);
router.delete("/delete/:id", isAdmin, deleteBooking);

module.exports = router;
