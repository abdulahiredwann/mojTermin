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
  createHospitalChatSession,
  listHospitalChatSessions,
  listHospitalChatMessages,
  chatSimulateHospitals,
  bulkCreateHospitals,
} = require("../controllers/adminHospitals.controller");

const router = express.Router();

router.get("/", requireAdminAuth, listHospitals);
router.post("/", requireAdminAuth, createHospital);
router.get("/chat-sessions", requireAdminAuth, listHospitalChatSessions);
router.post("/chat-sessions", requireAdminAuth, createHospitalChatSession);
router.get("/chat-sessions/:contextId/messages", requireAdminAuth, listHospitalChatMessages);
router.post("/chat-simulate", requireAdminAuth, chatSimulateHospitals);
router.post("/bulk-create", requireAdminAuth, bulkCreateHospitals);
router.post("/bulk-delete", requireAdminAuth, bulkDeleteHospitals);
router.patch("/:hospitalId", requireAdminAuth, updateHospital);
router.delete("/:hospitalId", requireAdminAuth, deleteHospital);
router.post("/:hospitalId/services", requireAdminAuth, addService);
router.patch("/:hospitalId/services/:serviceId", requireAdminAuth, updateService);
router.delete("/:hospitalId/services/:serviceId", requireAdminAuth, deleteService);

module.exports = router;
