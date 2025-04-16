const { sequelize } = require("../../../config/database");

// Add a new medicine
const addMedicine = async (req, res) => {
  try {
    const {
      medicine_id,
      name,
      description,
      unit_type,
      unit_price,
      dosage_frequency,
      quantity_available,
      availability_status,
      created_by,
    } = req.body;

    const query = `
      INSERT INTO medicine (
        medicine_id,
        name,
        description,
        unit_type,
        unit_price,
        dosage_frequency,
        quantity_available,
        availability_status,
        created_by,
        updated_by,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    await sequelize.query(query, {
      replacements: [
        medicine_id,
        name,
        description,
        unit_type,
        unit_price,
        dosage_frequency,
        quantity_available,
        availability_status,
        created_by,
        created_by, // updated_by = created_by at first
      ],
    });

    return res.status(201).json({ success: true, message: "Medicine added successfully." });
  } catch (error) {
    console.error("Error adding medicine:", error);
    return res.status(500).json({ success: false, message: "Error adding medicine." });
  }
};

module.exports = {
  addMedicine,
};
