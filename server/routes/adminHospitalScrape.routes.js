const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth.middleware");
const {
  getHospitalScrapeMeta,
  listHospitalScrapeRows,
} = require("../controllers/adminHospitalScrape.controller");

const router = express.Router();

router.get("/meta", requireAdminAuth, getHospitalScrapeMeta);
router.get("/rows", requireAdminAuth, listHospitalScrapeRows);

module.exports = router;
