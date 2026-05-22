const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth.middleware");
const {
  listAdminUsers,
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
} = require("../controllers/adminUsers.controller");

const router = express.Router();

router.get("/", requireAdminAuth, listAdminUsers);
router.get("/:userId", requireAdminAuth, getAdminUser);
router.patch("/:userId", requireAdminAuth, updateAdminUser);
router.delete("/:userId", requireAdminAuth, deleteAdminUser);

module.exports = router;
