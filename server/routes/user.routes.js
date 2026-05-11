const express = require("express");
const { requireUserAuth } = require("../middleware/userAuth.middleware");
const { listMyAppointmentRequests } = require("../controllers/userAppointments.controller");

const router = express.Router();

router.get("/appointments", requireUserAuth, listMyAppointmentRequests);

module.exports = router;
