const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth.middleware");
const { optionalUserAuth } = require("../middleware/userAuth.middleware");
const {
  maybeReferralUpload,
  referralMulterErrorHandler,
} = require("../middleware/referralUpload.middleware");
const {
  createAppointmentRequest,
  listAppointmentRequests,
} = require("../controllers/appointments.controller");

const router = express.Router();

router.post("/", optionalUserAuth, maybeReferralUpload, createAppointmentRequest);

router.get("/", requireAdminAuth, listAppointmentRequests);

router.use(referralMulterErrorHandler);

module.exports = router;

