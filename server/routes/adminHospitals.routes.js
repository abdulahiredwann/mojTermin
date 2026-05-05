const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth.middleware");
const {
  listHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  bulkDeleteHospitals,
  addService,
  updateService,
  deleteService,
} = require("../controllers/adminHospitals.controller");

const router = express.Router();

router.get("/", requireAdminAuth, listHospitals);
router.post("/", requireAdminAuth, createHospital);
router.post("/bulk-delete", requireAdminAuth, bulkDeleteHospitals);
router.patch("/:hospitalId", requireAdminAuth, updateHospital);
router.delete("/:hospitalId", requireAdminAuth, deleteHospital);
router.post("/:hospitalId/services", requireAdminAuth, addService);
router.patch("/:hospitalId/services/:serviceId", requireAdminAuth, updateService);
router.delete("/:hospitalId/services/:serviceId", requireAdminAuth, deleteService);

module.exports = router;
