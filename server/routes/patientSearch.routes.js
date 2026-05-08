const express = require("express");
const {
  searchAppointments,
  getCities,
} = require("../controllers/patientSearch.controller");

const router = express.Router();

// Public endpoints - no auth required
router.post("/", searchAppointments);
router.get("/cities", getCities);

module.exports = router;
