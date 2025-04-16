const { sequelize } = require("../../../config/database");

const getPrescriptionByAppointmentId = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    if (!appointment_id) {
      return res
        .status(400)
        .json({ success: false, message: "appointment_id is required" });
    }

    // 1. Fetch prescription info
    const [prescriptionData] = await sequelize.query(
      `SELECT * FROM prescription WHERE appointment_id = ?`,
      { replacements: [appointment_id] }
    );

    if (prescriptionData.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No prescription found for this appointment.",
        });
    }

    const prescription = prescriptionData[0];

    // 2. Fetch prescription items
    const [items] = await sequelize.query(
      `SELECT * FROM prescription_items WHERE prescription_id = ?`,
      { replacements: [prescription.prescription_id] }
    );

    return res.status(200).json({
      success: true,
      data: {
        prescription,
        items,
      },
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching prescription data." });
  }
};

module.exports = {
  getPrescriptionByAppointmentId,
};
