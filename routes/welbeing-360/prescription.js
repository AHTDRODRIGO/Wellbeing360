const express = require("express");
const router = express.Router();
const {
  issuePrescriptionAndCompleteAppointment,
} = require("../../controllers/wellbeing-360/prescription/add");
const {getPrescriptionByAppointmentId} = require("../../controllers/wellbeing-360/prescription/get");


router.post("/issue", issuePrescriptionAndCompleteAppointment);
router.get("/by-appointment/:appointment_id", getPrescriptionByAppointmentId);

module.exports = router;
