const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth.middleware");
const {
  createAppointmentRequest,
  listAppointmentRequests,
} = require("../controllers/appointments.controller");

const router = express.Router();

// Public: create request from landing page
router.post("/", createAppointmentRequest);

// Admin: list requests
router.get("/", requireAdminAuth, listAppointmentRequests);

module.exports = router;

