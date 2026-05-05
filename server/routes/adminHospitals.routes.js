const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth.middleware");
const { listHospitals } = require("../controllers/adminHospitals.controller");

const router = express.Router();

router.get("/", requireAdminAuth, listHospitals);

module.exports = router;
