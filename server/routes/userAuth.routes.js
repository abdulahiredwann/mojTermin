const express = require("express");
const { requireUserAuth } = require("../middleware/userAuth.middleware");
const { createUserAccount } = require("../controllers/userAccount.controller");
const { loginUser, meUser, logoutUser } = require("../controllers/userAuth.controller");

const router = express.Router();

router.post("/register", createUserAccount);
router.post("/login", loginUser);
router.get("/me", requireUserAuth, meUser);
router.post("/logout", requireUserAuth, logoutUser);

module.exports = router;
