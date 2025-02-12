const express = require("express");
const {
  bookAppointment,
  getEmployeeAppointments,
  cancelAppointment,
  getAllAppointments,
  getAppointmentsByDoctor,
} = require("../../controllers/hris/appointment/bookAppointment");

const router = express.Router();

// Book an appointment
router.post("/book-appointment", bookAppointment);
router.get("/get-all-book-appointments", getEmployeeAppointments);
router.delete("/cance-appointment", cancelAppointment);
router.get("/get-all-appointments", getAllAppointments);
router.get("/get-appointments-by-doctor", getAppointmentsByDoctor);
module.exports = router;
