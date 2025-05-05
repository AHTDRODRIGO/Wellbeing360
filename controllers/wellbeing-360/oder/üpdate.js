const { sequelize } = require("../../../config/database");

const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { order_id } = req.params;
    const { status, payment_method } = req.body;

    const validStatuses = [
      "processing",
      "completed",
      "delivered",
      "ready_to_pickup",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    // 1. Update order status
    await sequelize.query(
      `UPDATE orders SET order_status = ? WHERE order_id = ?`,
      {
        replacements: [status, order_id],
        transaction,
      }
    );

    // 2. If status is completed, create payment entry
    if (status === "completed") {
      // Get order info first (to get employee_no)
      const [orderData] = await sequelize.query(
        `SELECT * FROM orders WHERE order_id = ?`,
        {
          replacements: [order_id],
          transaction,
        }
      );

      if (orderData.length === 0) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Order not found." });
      }

      const employee_no = orderData[0].employee_no;

      // 3. Get all items inside this order (with medicine_id)
      const [orderItems] = await sequelize.query(
        `SELECT oi.medicine_id, oi.quantity_requested, m.unit_price
         FROM order_items oi
         LEFT JOIN medicine m ON oi.medicine_id = m.medicine_id
         WHERE oi.order_id = ?`,
        { replacements: [order_id], transaction }
      );

      if (orderItems.length === 0) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ success: false, message: "No order items found." });
      }

      // 4. Calculate Total Price
      let totalAmount = 0;
      orderItems.forEach((item) => {
        const pricePerUnit = item.unit_price || 0;
        const qty = item.quantity_requested || 0;
        totalAmount += pricePerUnit * qty;
      });

      // 5. Insert into payments table
      await sequelize.query(
        `INSERT INTO payments (order_id, employee_no, amount, payment_method, payment_status) 
         VALUES (?, ?, ?, ?, 'paid')`,
        {
          replacements: [
            order_id,
            employee_no,
            totalAmount,
            payment_method || "online",
          ],
          transaction,
        }
      );
    }

    await transaction.commit();
    return res
      .status(200)
      .json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error("Status update failed:", error);
    await transaction.rollback();
    return res
      .status(500)
      .json({ success: false, message: "Failed to update order status." });
  }
};

module.exports = { updateOrderStatus };
