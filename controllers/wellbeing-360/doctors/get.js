const { sequelize } = require("../../../config/database");

const getAllAppointments = async (req, res) => {
  try {
    const [appointments] = await sequelize.query(`
        SELECT 
          a.appointment_id,
          a.appointment_date,
          a.appointment_status,
          
          d.doctor_id,
          d.name AS doctor_name,
          d.specialization,
  
          e.employee_no,
          e.name AS employee_name,
  
          s.date AS schedule_date,
           s.schedule_id,
          s.start_time,
          s.end_time
  
        FROM appointment a
        LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
        LEFT JOIN employee e ON a.employee_no = e.employee_no
        LEFT JOIN doctor_schedule s ON a.schedule_id = s.schedule_id
        ORDER BY a.appointment_date DESC
      `);

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching appointment cards:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getAppointmentsByDoctorId = async (req, res) => {
  const { doctor_id } = req.query;

  if (!doctor_id) {
    return res
      .status(400)
      .json({ success: false, message: "doctor_id is required" });
  }

  try {
    const [appointments] = await sequelize.query(
      `SELECT * FROM appointment WHERE doctor_id = ? ORDER BY appointment_date DESC`,
      { replacements: [doctor_id] }
    );

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching appointments by doctor:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
const getEmployeeMedicalHistory = async (req, res) => {
  try {
    const { employee_no } = req.query;

    if (!employee_no) {
      return res
        .status(400)
        .json({ success: false, message: "employee_no is required" });
    }

    const [appointments] = await sequelize.query(
      `
        SELECT 
          a.appointment_id, a.appointment_date, a.appointment_status,
          d.name AS doctor_name, d.specialization,
          s.date AS schedule_date, s.start_time, s.end_time
        FROM appointment a
        LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
        LEFT JOIN doctor_schedule s ON a.schedule_id = s.schedule_id
        WHERE a.employee_no = ?
        ORDER BY a.appointment_date DESC
      `,
      { replacements: [employee_no] }
    );

    const [prescriptions] = await sequelize.query(
      `
        SELECT 
          p.prescription_id, p.issued_date, p.remarks,
          d.name AS doctor_name
        FROM prescription p
        LEFT JOIN doctor d ON p.doctor_id = d.doctor_id
        WHERE p.employee_no = ?
        ORDER BY p.issued_date DESC
      `,
      { replacements: [employee_no] }
    );

    const [prescriptionItems] = await sequelize.query(
      `
        SELECT 
          pi.prescription_id, pi.medicine_id, pi.medicine_name, 
          pi.quantity_prescribed, pi.dosage_instructions, pi.from_inventory
        FROM prescription_items pi
        WHERE pi.prescription_id IN (
          SELECT prescription_id FROM prescription WHERE employee_no = ?
        )
      `,
      { replacements: [employee_no] }
    );

    return res.status(200).json({
      success: true,
      data: {
        appointments,
        prescriptions,
        prescription_items: prescriptionItems,
      },
    });
  } catch (error) {
    console.error("Error fetching medical history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
 
module.exports = {
  getAllAppointments,
  getAppointmentsByDoctorId,
  getEmployeeMedicalHistory,
};
