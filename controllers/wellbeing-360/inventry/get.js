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

const getMedicineStatistics = async (req, res) => {
  try {
    // Get overall stats
    const [summary] = await sequelize.query(`
      SELECT 
        COUNT(*) AS total_products,
        SUM(quantity_available) AS total_stock,
        SUM(unit_price * quantity_available) AS total_stock_value
      FROM medicine
    `);

    // Get unavailable items
    const [unavailableItems] = await sequelize.query(`
      SELECT 
        medicine_id, name, quantity_available, unit_price 
      FROM medicine 
      WHERE availability_status = 0
    `);

    res.status(200).json({
      success: true,
      data: {
        total_products: summary[0].total_products,
        total_stock: summary[0].total_stock,
        total_stock_value: parseFloat(summary[0].total_stock_value).toFixed(2),
        unavailable_items: unavailableItems,
        unavailable_count: unavailableItems.length,
      },
    });
  } catch (error) {
    console.error("Error fetching medicine statistics:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching statistics." });
  }
};
module.exports = {
  getAllMedicines,
  searchMedicineByName,
  getMedicineStatistics,
};
