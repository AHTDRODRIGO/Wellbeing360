const { sequelize } = require("../../../config/database");

const bookAppointment = async (req, res) => {
  try {
    const { employee_no, doctor_id, schedule_id } = req.body;

    if (!employee_no || !doctor_id || !schedule_id) {
      return res.status(400).json({
        error: "Employee number, doctor ID, and schedule ID are required",
      });
    }

    // Check if schedule has available slots
    const checkQuery = `SELECT available_slots FROM doctor_schedule WHERE schedule_id = ?`;
    const [schedule] = await sequelize.query(checkQuery, {
      replacements: [schedule_id],
    });

    if (!schedule.length || schedule[0].available_slots <= 0) {
      return res
        .status(400)
        .json({ error: "No available slots for this schedule" });
    }

    // Insert new appointment
    const insertQuery = `
      INSERT INTO appointment (employee_no, doctor_id, schedule_id, appointment_date, appointment_status)
      SELECT ?, ?, ?, date, 'confirmed' FROM doctor_schedule WHERE schedule_id = ?`;

    await sequelize.query(insertQuery, {
      replacements: [employee_no, doctor_id, schedule_id, schedule_id],
    });

    // Deduct available slot
    const updateQuery = `
      UPDATE doctor_schedule 
      SET available_slots = available_slots - 1 
      WHERE schedule_id = ?`;

    await sequelize.query(updateQuery, { replacements: [schedule_id] });

    return res.status(201).json({ message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getEmployeeAppointments = async (req, res) => {
  try {
    const { employee_no } = req.query;

    if (!employee_no) {
      return res.status(400).json({ error: "Employee number is required" });
    }

    const query = `
        SELECT a.appointment_id, a.appointment_date, a.appointment_status, 
               d.name AS doctor_name, d.specialization, ds.start_time, ds.end_time
        FROM appointment a
        JOIN doctor d ON a.doctor_id = d.doctor_id
        JOIN doctor_schedule ds ON a.schedule_id = ds.schedule_id
        WHERE a.employee_no = ?
        ORDER BY a.appointment_date DESC`;

    const [appointments] = await sequelize.query(query, {
      replacements: [employee_no],
    });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching employee appointments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.query;

    if (!appointment_id) {
      return res.status(400).json({ error: "Appointment ID is required" });
    }

    // Get the schedule_id before deleting the appointment
    const getScheduleQuery = `SELECT schedule_id FROM appointment WHERE appointment_id = ?`;
    const [appointment] = await sequelize.query(getScheduleQuery, {
      replacements: [appointment_id],
    });

    if (!appointment.length) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const schedule_id = appointment[0].schedule_id;

    // Delete appointment
    const deleteQuery = `DELETE FROM appointment WHERE appointment_id = ?`;
    await sequelize.query(deleteQuery, { replacements: [appointment_id] });

    // Restore available slot
    const restoreSlotQuery = `
        UPDATE doctor_schedule 
        SET available_slots = available_slots + 1 
        WHERE schedule_id = ?`;

    await sequelize.query(restoreSlotQuery, { replacements: [schedule_id] });

    return res
      .status(200)
      .json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const query = `
        SELECT a.appointment_id, a.appointment_date, a.appointment_status, 
               e.employee_no, e.name AS employee_name, e.contact_number,
               d.doctor_id, d.name AS doctor_name, d.specialization, 
               ds.start_time, ds.end_time
        FROM appointment a
        JOIN employee e ON a.employee_no = e.employee_no
        JOIN doctor d ON a.doctor_id = d.doctor_id
        JOIN doctor_schedule ds ON a.schedule_id = ds.schedule_id
        ORDER BY a.appointment_date DESC`;

    const [appointments] = await sequelize.query(query);

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctor_id } = req.query;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const query = `
        SELECT a.appointment_id, a.appointment_date, a.appointment_status, 
               e.employee_no, e.name AS employee_name, e.contact_number,
               ds.start_time, ds.end_time
        FROM appointment a
        JOIN employee e ON a.employee_no = e.employee_no
        JOIN doctor_schedule ds ON a.schedule_id = ds.schedule_id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC`;

    const [appointments] = await sequelize.query(query, {
      replacements: [doctor_id],
    });

    if (appointments.length === 0) {
      return res
        .status(404)
        .json({ error: "No appointments found for this doctor" });
    }

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
 
module.exports = {
  bookAppointment,
  getEmployeeAppointments,
  cancelAppointment,
  getAllAppointments,
  getAppointmentsByDoctor,
};
