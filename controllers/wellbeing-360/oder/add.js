const { sequelize } = require("../../../config/database");

const placeOrderByPrescription = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { prescription_id, pharmacy_type, delivery_type, notes } = req.body;

    if (!prescription_id || !pharmacy_type || !delivery_type) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // 1. Get prescription data
    const [prescriptions] = await sequelize.query(
      `SELECT * FROM prescription WHERE prescription_id = ?`,
      { replacements: [prescription_id], transaction }
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ success: false, message: "Prescription not found." });
    }

    const employee_no = prescriptions[0].employee_no;

    // 2. Get prescription items
    const [prescriptionItems] = await sequelize.query(
      `SELECT * FROM prescription_items WHERE prescription_id = ?`,
      { replacements: [prescription_id], transaction }
    );

    if (prescriptionItems.length === 0) {
      return res.status(404).json({ success: false, message: "No items found in this prescription." });
    }

    // 3. Create order
    await sequelize.query(
      `INSERT INTO orders 
        (prescription_id, employee_no, pharmacy_type, delivery_type, order_status, placed_date, notes) 
       VALUES (?, ?, ?, ?, 'placed', NOW(), ?)`,
      {
        replacements: [
          prescription_id,
          employee_no,
          pharmacy_type,
          delivery_type,
          notes
        ],
        transaction
      }
    );

    const [lastInserted] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`, { transaction });
    const order_id = lastInserted[0].id;

    // 4. Add each item to order_items
    for (const item of prescriptionItems) {
      const {
        medicine_id,
        medicine_name,
        quantity_prescribed,
        from_inventory
      } = item;

      // Optional: You can check if the stock is enough, else fallback to outdoor pharmacy
      const [inventory] = await sequelize.query(
        `SELECT quantity_available FROM medicine WHERE medicine_id = ?`,
        { replacements: [medicine_id], transaction }
      );

      const availableStock = inventory[0]?.quantity_available || 0;
      const isInStock = availableStock >= quantity_prescribed;

      await sequelize.query(
        `INSERT INTO order_items 
        (order_id, medicine_id, medicine_name, quantity_requested, from_inventory, from_outdoor_pharmacy)
        VALUES (?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            order_id,
            isInStock ? medicine_id : null,
            medicine_name,
            quantity_prescribed,
            isInStock,
            !isInStock
          ],
          transaction
        }
      );
    }

    await transaction.commit();
    return res.status(201).json({ success: true, message: "Order placed successfully based on prescription." });
  } catch (error) {
    console.error("Order creation error:", error);
    await transaction.rollback();
    return res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

module.exports = { placeOrderByPrescription };
