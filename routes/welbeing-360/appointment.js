const express = require("express");
const {
  bookAppointment,
  getEmployeeAppointments,
  cancelAppointment,
  getAllAppointments,
  getAppointmentsByDoctor,
  updateAppointmentStatus,
} = require("../../controllers/wellbeing-360/appointment/bookAppointment");

const router = express.Router();

// Book an appointment
router.post("/book-appointment", bookAppointment);
router.get("/get-all-book-appointments", getEmployeeAppointments);
router.delete("/cancel-appointment", cancelAppointment);
router.get("/get-all-appointments", getAllAppointments);
router.get("/get-appointments-by-doctor", getAppointmentsByDoctor);
router.put("/update-appointments", updateAppointmentStatus);

module.exports = router;
