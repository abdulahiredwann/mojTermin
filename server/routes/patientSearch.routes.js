const express = require("express");
const {
  searchAppointments,
  getCities,
  listLocations,
} = require("../controllers/patientSearch.controller");

const router = express.Router();

// Public endpoints - no auth required
router.get("/locations", listLocations);
router.post("/", searchAppointments);
router.get("/cities", getCities);

module.exports = router;
