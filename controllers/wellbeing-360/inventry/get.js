const { sequelize } = require("../../../config/database");

// controllers/medicine.controller.js

const getAllMedicines = async (req, res) => {
  try {
    const [results] = await sequelize.query(`SELECT * FROM medicine`);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching medicines." });
  }
};
const searchMedicineByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name query is required." });
    }

    const [results] = await sequelize.query(
      `SELECT * FROM medicine WHERE name LIKE ?`,
      { replacements: [`%${name}%`] }
    );

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error searching medicine:", error);
    res
      .status(500)
      .json({ success: false, message: "Error searching medicine." });
  }
};

module.exports = {
  getAllMedicines,
  searchMedicineByName,
};
