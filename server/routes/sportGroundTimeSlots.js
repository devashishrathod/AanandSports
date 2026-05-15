const express = require("express");
const router = express.Router();

const { verifyJwtToken } = require("../middlewares");
const {
  createRange,
  getAll,
  update,
  deleteTimeSlot,
} = require("../controllers/sportGroundTimeSlots");

router.post("/createRange", verifyJwtToken, createRange);
router.get("/getAll", verifyJwtToken, getAll);
router.put("/update/:id", verifyJwtToken, update);
router.delete("/delete/:id", verifyJwtToken, deleteTimeSlot);

module.exports = router;
