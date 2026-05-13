const express = require("express");
const {
  searchAppointments,
  getCities,
  listLocations,
} = require("../controllers/patientSearch.controller");
const {
  maybeSearchReferralUpload,
  referralUploadErrorHandler,
} = require("../middleware/referralUpload.middleware");

const router = express.Router();

// Public endpoints - no auth required
router.get("/locations", listLocations);
router.post("/", maybeSearchReferralUpload, searchAppointments);
router.use(referralUploadErrorHandler);
router.get("/cities", getCities);

module.exports = router;
