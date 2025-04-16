const { sequelize } = require("../../../config/database");

const getOrdersByEmployee = async (req, res) => {
  try {
    const { employee_no } = req.query;

    if (!employee_no) {
      return res
        .status(400)
        .json({ success: false, message: "employee_no is required." });
    }

    const [orders] = await sequelize.query(
      `SELECT * FROM orders WHERE employee_no = ? ORDER BY placed_date DESC`,
      { replacements: [employee_no] }
    );

    if (orders.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No orders found for this employee.",
        });
    }

    const orderIds = orders.map((order) => order.order_id);
    const [items] = await sequelize.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds
        .map(() => "?")
        .join(",")})`,
      { replacements: orderIds }
    );

    const orderMap = {};
    orders.forEach((order) => {
      orderMap[order.order_id] = { ...order, items: [] };
    });

    items.forEach((item) => {
      orderMap[item.order_id].items.push(item);
    });

    const result = Object.values(orderMap);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders." });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // 1. Get all orders
    const [orders] = await sequelize.query(
      `SELECT * FROM orders ORDER BY placed_date DESC`
    );

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found." });
    }

    // 2. Get all related items
    const orderIds = orders.map((order) => order.order_id);
    const [items] = await sequelize.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds
        .map(() => "?")
        .join(",")})`,
      { replacements: orderIds }
    );

    // 3. Map items to orders
    const orderMap = {};
    orders.forEach((order) => {
      orderMap[order.order_id] = { ...order, items: [] };
    });

    items.forEach((item) => {
      orderMap[item.order_id].items.push(item);
    });

    const result = Object.values(orderMap);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders." });
  }
};
module.exports = {
  getOrdersByEmployee,
  getAllOrders,
};
