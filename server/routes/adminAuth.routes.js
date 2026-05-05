const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth.middleware");
const {
  loginAdmin,
  meAdmin,
  logoutAdmin,
} = require("../controllers/adminAuth.controller");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", requireAdminAuth, meAdmin);
router.post("/logout", requireAdminAuth, logoutAdmin);

module.exports = router;
