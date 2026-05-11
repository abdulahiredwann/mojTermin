const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth.middleware");
const { optionalUserAuth } = require("../middleware/userAuth.middleware");
const {
  createAppointmentRequest,
  listAppointmentRequests,
} = require("../controllers/appointments.controller");

const router = express.Router();

router.post("/", optionalUserAuth, createAppointmentRequest);

router.get("/", requireAdminAuth, listAppointmentRequests);

module.exports = router;

