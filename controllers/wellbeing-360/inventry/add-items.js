const { sequelize } = require("../../../config/database");

// Helper function to generate next medicine_id
const generateMedicineId = (lastId) => {
  if (!lastId) return "MED001";
  const number = parseInt(lastId.replace("MED", ""), 10) + 1;
  return `MED${String(number).padStart(3, "0")}`;
};

// Add a new medicine
const addMedicine = async (req, res) => {
  try {
    const {
      name,
      description,
      unit_type,
      unit_price,
      dosage_frequency,
      quantity_available,
      availability_status,
      created_by,
    } = req.body;

    // Get the latest medicine_id
    const [latestMedicine] = await sequelize.query(
      `SELECT medicine_id FROM medicine ORDER BY createdAt DESC LIMIT 1`
    );

    const lastId =
      latestMedicine.length > 0 ? latestMedicine[0].medicine_id : null;
    const newMedicineId = generateMedicineId(lastId);

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
        newMedicineId,
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

    return res
      .status(201)
      .json({
        success: true,
        message: "Medicine added successfully.",
        medicine_id: newMedicineId,
      });
  } catch (error) {
    console.error("Error adding medicine:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error adding medicine." });
  }
};

module.exports = {
  addMedicine,
};
