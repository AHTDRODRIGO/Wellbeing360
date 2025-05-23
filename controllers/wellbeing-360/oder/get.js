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
      return res.status(404).json({
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
const getOrderById = async (req, res) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res
        .status(400)
        .json({ success: false, message: "order_id is required." });
    }

    // 1. Get the order
    const [orderData] = await sequelize.query(
      `SELECT * FROM orders WHERE order_id = ?`,
      { replacements: [order_id] }
    );

    if (orderData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const order = orderData[0];

    // 2. Get the order items
    const [items] = await sequelize.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      { replacements: [order_id] }
    );

    // 3. Check stock status for each item
    const itemsWithStockStatus = await Promise.all(
      items.map(async (item) => {
        if (!item.medicine_id || item.from_outdoor_pharmacy) {
          return { ...item, stock_status: "Collect from outside" };
        }

        const [stockResult] = await sequelize.query(
          `SELECT quantity_available FROM medicine WHERE medicine_id = ?`,
          { replacements: [item.medicine_id] }
        );

        const quantity = stockResult[0]?.quantity_available ?? 0;
        const stock_status =
          quantity >= item.quantity_requested ? "In Stock" : "Out of Stock";

        return {
          ...item,
          stock_status,
        };
      })
    );

    // 4. Determine status flow
    const status_flow =
      order.delivery_type === "pickup"
        ? ["placed", "processing", "completed", "ready_to_pickup"]
        : ["placed", "processing", "completed", "delivered"];

    // 5. Final response
    const result = {
      ...order,
      items: itemsWithStockStatus,
      status_flow, // added here
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch order details." });
  }
};

const getOrdersWithPaymentStatusByEmployee = async (req, res) => {
  try {
    const { employee_no } = req.query;

    if (!employee_no) {
      return res
        .status(400)
        .json({ success: false, message: "employee_no is required." });
    }

    const [orders] = await sequelize.query(
      `SELECT o.*, p.payment_status, p.amount 
       FROM orders o
       LEFT JOIN payments p ON o.order_id = p.order_id
       WHERE o.employee_no = ?
       ORDER BY o.placed_date DESC`,
      { replacements: [employee_no] }
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this employee.",
      });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders with payment status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders." });
  }
};

const getOrdersByEmployeeDetailed = async (req, res) => {
  try {
    const { employee_no } = req.query;

    if (!employee_no) {
      return res.status(400).json({
        success: false,
        message: "Missing employee number.",
      });
    }

    // 1. Fetch orders
    const [orders] = await sequelize.query(
      `SELECT * FROM orders WHERE employee_no = ? ORDER BY placed_date DESC`,
      { replacements: [employee_no] }
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this employee.",
      });
    }

    const orderIds = orders.map((o) => o.order_id);

    // 2. Fetch items
    const [items] = await sequelize.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds
        .map(() => "?")
        .join(",")})`,
      { replacements: orderIds }
    );

    // 3. Fetch employee details
    const [employeeDetails] = await sequelize.query(
      `SELECT * FROM employee WHERE employee_no = ?`,
      { replacements: [employee_no] }
    );

    // 4. Merge items with orders
    const orderMap = {};
    orders.forEach((order) => {
      orderMap[order.order_id] = { ...order, items: [] };
    });

    items.forEach((item) => {
      orderMap[item.order_id].items.push(item);
    });

    const result = {
      employee: employeeDetails[0] || null,
      orders: Object.values(orderMap),
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching employee orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
const getAllPaymentsWithEmployee = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        p.payment_id,
        p.order_id,
        p.employee_no,
        p.amount,
        p.payment_method,
        p.payment_status,
        p.payment_date,
        e.name AS employee_name,
        e.nic,
        e.department,
        e.designation
      FROM payments p
      LEFT JOIN employee e ON p.employee_no = e.employee_no
      ORDER BY p.payment_date DESC
    `);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching payments with employee info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments.",
    });
  }
};
const getDashboardStats = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const targetDate = new Date(date);
    const pastDate = new Date(targetDate);
    pastDate.setDate(pastDate.getDate() - 4); // Go 4 days back (total 5 days incl. today)

    const formattedDate = (d) => d.toISOString().slice(0, 10);

    // 1. Orders Per Day
    const [ordersPerDay] = await sequelize.query(
      `
      SELECT DATE(placed_date) AS day, COUNT(*) AS total_orders
      FROM orders
      WHERE DATE(placed_date) BETWEEN ? AND ?
      GROUP BY day
      ORDER BY day DESC
      `,
      { replacements: [formattedDate(pastDate), formattedDate(targetDate)] }
    );

    // 2. Top Inventory Item
    const [topInventoryItem] = await sequelize.query(
      `
      SELECT medicine_name, SUM(quantity_requested) AS total
      FROM order_items
      WHERE from_inventory = 1 AND order_id IN (
        SELECT order_id FROM orders
        WHERE DATE(placed_date) BETWEEN ? AND ?
      )
      GROUP BY medicine_name
      ORDER BY total DESC
      LIMIT 1
      `,
      { replacements: [formattedDate(pastDate), formattedDate(targetDate)] }
    );

    // 3. Income Per Day
    const [incomePerDay] = await sequelize.query(
      `
      SELECT DATE(payment_date) AS day, SUM(amount) AS income
      FROM payments
      WHERE payment_status = 'paid' AND DATE(payment_date) BETWEEN ? AND ?
      GROUP BY day
      ORDER BY day DESC
      `,
      { replacements: [formattedDate(pastDate), formattedDate(targetDate)] }
    );

    // 4. Most Frequently Out-of-Stock Item
    const [outOfStockItem] = await sequelize.query(
      `
      SELECT oi.medicine_name, COUNT(*) AS times_out_of_stock
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN medicine m ON oi.medicine_id = m.medicine_id
      WHERE DATE(o.placed_date) BETWEEN ? AND ? 
        AND m.quantity_available < oi.quantity_requested
      GROUP BY oi.medicine_name
      ORDER BY times_out_of_stock DESC
      LIMIT 1
      `,
      { replacements: [formattedDate(pastDate), formattedDate(targetDate)] }
    );

    // ✅ Return all stats
    return res.status(200).json({
      success: true,
      data: {
        date_range: {
          from: formattedDate(pastDate),
          to: formattedDate(targetDate),
        },
        orders_per_day: ordersPerDay,
        top_inventory_item: topInventoryItem[0] || null,
        income_per_day: incomePerDay,
        most_out_of_stock_item: outOfStockItem[0] || null,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getOrdersByEmployee,
  getAllOrders,
  getOrderById,
  getOrdersWithPaymentStatusByEmployee,
  getOrdersByEmployeeDetailed,
  getAllPaymentsWithEmployee,
  getDashboardStats,
};
