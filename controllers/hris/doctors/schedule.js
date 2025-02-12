const { sequelize } = require("../../../config/database");

const addDoctorSchedule = async (req, res) => {
  try {
    const { doctor_id, schedules } = req.body;

    if (!doctor_id || !Array.isArray(schedules) || schedules.length === 0) {
      return res
        .status(400)
        .json({ error: "Doctor ID and schedule list are required" });
    }

    // Check if the doctor already has a schedule for any of the provided dates
    const dates = schedules.map(({ date }) => `'${date}'`).join(", ");
    const checkQuery = `
      SELECT date FROM doctor_schedule 
      WHERE doctor_id = ? AND date IN (${dates})`;

    const [existingSchedules] = await sequelize.query(checkQuery, {
      replacements: [doctor_id],
    });

    if (existingSchedules.length > 0) {
      return res.status(409).json({
        error: `Doctor already has a schedule on these dates: ${existingSchedules
          .map((s) => s.date)
          .join(", ")}`,
      });
    }

    // Construct SQL query for multiple inserts
    const insertQuery = `
      INSERT INTO doctor_schedule 
      (doctor_id, date, start_time, end_time, max_patients, available_slots) 
      VALUES ${schedules.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")}`;

    // Flatten schedule data for replacements
    const replacements = schedules.flatMap(
      ({ date, start_time, end_time, max_patients }) => [
        doctor_id,
        date,
        start_time,
        end_time,
        max_patients,
        max_patients, // Available slots start at max patients
      ]
    );

    await sequelize.query(insertQuery, { replacements });

    return res
      .status(201)
      .json({ message: "Doctor schedule added successfully" });
  } catch (error) {
    console.error("Error adding doctor schedule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getDoctorsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const query = `
      SELECT DISTINCT d.doctor_id, d.name, d.specialization, d.contact_number, d.email, d.work_location, d.availability
      FROM doctor d
      INNER JOIN doctor_schedule ds ON d.doctor_id = ds.doctor_id
      WHERE ds.date = ? AND ds.available_slots > 0`;

    const [doctors] = await sequelize.query(query, {
      replacements: [date],
    });

    if (doctors.length === 0) {
      return res
        .status(404)
        .json({ error: "No available doctors on this date" });
    }

    return res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors by date:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getUpcomingSchedulesByDoctor = async (req, res) => {
  try {
    const { doctor_id } = req.query;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const query = `
        SELECT schedule_id, date, start_time, end_time, max_patients, available_slots
        FROM doctor_schedule
        WHERE doctor_id = ? AND date >= CURDATE()
        ORDER BY date ASC`;

    const [schedules] = await sequelize.query(query, {
      replacements: [doctor_id],
    });

    if (schedules.length === 0) {
      return res
        .status(404)
        .json({ error: "No upcoming schedules for this doctor" });
    }

    return res.status(200).json({ schedules });
  } catch (error) {
    console.error("Error fetching upcoming schedules:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const updateDoctorSchedule = async (req, res) => {
  try {
    const { schedule_id } = req.query;

    if (!schedule_id) {
      return res.status(400).json({ error: "Schedule ID is required" });
    }

    const { date, start_time, end_time, max_patients, available_slots } =
      req.body;

    // If available slots reach 0, remove the schedule
    if (available_slots === 0) {
      const deleteQuery = `DELETE FROM doctor_schedule WHERE schedule_id = ?`;
      const [deleteResult] = await sequelize.query(deleteQuery, {
        replacements: [schedule_id],
      });

      if (deleteResult.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Schedule not found or already removed" });
      }

      return res
        .status(200)
        .json({ message: "Schedule removed as no available slots were left" });
    }

    // Update schedule details if still available
    const updateQuery = `
        UPDATE doctor_schedule
        SET 
          date = ?, 
          start_time = ?, 
          end_time = ?, 
          max_patients = ?, 
          available_slots = ?
        WHERE schedule_id = ?`;

    const [updateResult] = await sequelize.query(updateQuery, {
      replacements: [
        date,
        start_time,
        end_time,
        max_patients,
        available_slots,
        schedule_id,
      ],
    });

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    return res
      .status(200)
      .json({ message: "Doctor schedule updated successfully" });
  } catch (error) {
    console.error("Error updating doctor schedule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const deleteDoctorSchedule = async (req, res) => {
  try {
    const { schedule_id } = req.query;

    if (!schedule_id) {
      return res.status(400).json({ error: "Schedule ID is required" });
    }

    const deleteQuery = `DELETE FROM doctor_schedule WHERE schedule_id = ?`;

    const [deleteResult] = await sequelize.query(deleteQuery, {
      replacements: [schedule_id],
    });

    if (deleteResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Schedule not found or already removed" });
    }

    return res
      .status(200)
      .json({ message: "Doctor schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor schedule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  addDoctorSchedule,
  getDoctorsByDate,
  getUpcomingSchedulesByDoctor,
  updateDoctorSchedule,
  deleteDoctorSchedule,
};
