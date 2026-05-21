const express = require("express");
const { requireUserAuth } = require("../middleware/userAuth.middleware");
const {
  listMyAppointmentRequests,
  updateMyAppointmentRequest,
  deleteMyAppointmentRequest,
  deleteMyAppointmentReferralImage,
} = require("../controllers/userAppointments.controller");
const {
  updateMyProfile,
  updateMyPassword,
  cancelMySubscription,
} = require("../controllers/userSettings.controller");

const router = express.Router();

router.patch("/profile", requireUserAuth, updateMyProfile);
router.patch("/password", requireUserAuth, updateMyPassword);
router.post("/subscription/cancel", requireUserAuth, cancelMySubscription);

router.get("/appointments", requireUserAuth, listMyAppointmentRequests);
router.patch("/appointments/:id", requireUserAuth, updateMyAppointmentRequest);
router.delete("/appointments/:id/referral-images", requireUserAuth, deleteMyAppointmentReferralImage);
router.delete("/appointments/:id", requireUserAuth, deleteMyAppointmentRequest);

module.exports = router;
