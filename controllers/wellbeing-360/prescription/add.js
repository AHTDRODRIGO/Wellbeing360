const { sequelize } = require("../../../config/database");

const issuePrescriptionAndCompleteAppointment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      appointment_id,
      doctor_id,
      employee_no,
      remarks,
      items
    } = req.body;

    if (!appointment_id || !doctor_id || !employee_no || !items?.length) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // 1. Update appointment status to completed
    await sequelize.query(
      `UPDATE appointment SET appointment_status = 'completed' WHERE appointment_id = ?`,
      { replacements: [appointment_id], transaction }
    );

    // 2. Insert into prescription table
    const [prescriptionResult] = await sequelize.query(
      `INSERT INTO prescription (appointment_id, doctor_id, employee_no, issued_date, remarks)
       VALUES (?, ?, ?, CURDATE(), ?)`,
      {
        replacements: [appointment_id, doctor_id, employee_no, remarks],
        transaction,
      }
    );

    const prescriptionId = prescriptionResult ? prescriptionResult : null;
    const [resultRow] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`, { transaction });
    const newPrescriptionId = resultRow[0]?.id;

    // 3. Insert each item into prescription_items
    for (const item of items) {
      const {
        medicine_id,
        medicine_name,
        quantity_prescribed,
        from_inventory,
        dosage_instructions
      } = item;

      if (!medicine_name || !quantity_prescribed) {
        throw new Error("Each item must include medicine_name and quantity_prescribed");
      }

      await sequelize.query(
        `INSERT INTO prescription_items 
          (prescription_id, medicine_id, medicine_name, quantity_prescribed, from_inventory, dosage_instructions)
         VALUES (?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            newPrescriptionId,
            from_inventory ? medicine_id : null,
            medicine_name,
            quantity_prescribed,
            from_inventory,
            dosage_instructions
          ],
          transaction
        }
      );
    }

    await transaction.commit();
    return res.status(201).json({ success: true, message: "Prescription issued and appointment completed." });
  } catch (error) {
    console.error("Prescription error:", error);
    await transaction.rollback();
    return res.status(500).json({ success: false, message: "Failed to issue prescription." });
  }
};

module.exports = {
  issuePrescriptionAndCompleteAppointment,
};
