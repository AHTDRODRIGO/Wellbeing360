const express = require("express");
const {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../../controllers/wellbeing-360/doctors/add");
const {
  addDoctorSchedule,
  getDoctorsByDate,
  getUpcomingSchedulesByDoctor,
  updateDoctorSchedule,
  deleteDoctorSchedule,
} = require("../../controllers/wellbeing-360/doctors/schedule");  

const router = express.Router();

//doctor
router.post("/add-doctors", addDoctor);
router.get("/get-doctors", getDoctors);
router.get("/get-doctor-by-id", getDoctorById);
router.put("/update-doctor", updateDoctor);
router.delete("/delete-doctor", deleteDoctor);

//Schedule
router.post("/add-doctor-schedule", addDoctorSchedule);
router.get("/get-doctor-by-date", getDoctorsByDate);
router.get("/upcoming-schedules", getUpcomingSchedulesByDoctor);
router.put("/schedule", updateDoctorSchedule);
router.delete("/schedule", deleteDoctorSchedule);

module.exports = router;
