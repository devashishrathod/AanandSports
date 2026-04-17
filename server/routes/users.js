const express = require("express");
const router = express.Router();

const {
  getUser,
  updateUser,
  getAllUsers,
  deleteUser,
} = require("../controllers/users");
const { verifyJwtToken } = require("../middlewares");

router.get("/get", verifyJwtToken, getUser);
router.put("/update", verifyJwtToken, updateUser);
router.get("/getAll", verifyJwtToken, getAllUsers);
router.delete("/delete/:id", verifyJwtToken, deleteUser);

module.exports = router;
