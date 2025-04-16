const { sequelize } = require("../../../config/database");
const updateOrderStatus = async (req, res) => {
    try {
      const { order_id } = req.params;
      const { status } = req.body;
  
      const validStatuses = ["processing", "completed", "delivered", "ready_to_pickup"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status." });
      }
  
      await sequelize.query(
        `UPDATE orders SET order_status = ? WHERE order_id = ?`,
        {
          replacements: [status, order_id]
        }
      );
  
      return res.status(200).json({ success: true, message: `Order status updated to ${status}` });
    } catch (error) {
      console.error("Status update failed:", error);
      return res.status(500).json({ success: false, message: "Failed to update order status." });
    }
  };
  
  module.exports = { updateOrderStatus };
