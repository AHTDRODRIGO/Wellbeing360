const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Order = sequelize.define("Order", {
  order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  prescription_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  employee_no: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  pharmacy_type: {
    type: DataTypes.ENUM("pharma", "hospital"),
    allowNull: false,
  },
  delivery_type: {
    type: DataTypes.ENUM("pickup", "delivery"),
    allowNull: false,
  },
  order_status: {
    type: DataTypes.ENUM("placed", "processing", "completed", "delivered", "ready_to_pickup"),
    allowNull: false,
    defaultValue: "placed",
  },
  placed_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "orders",
  timestamps: false,
});

module.exports = Order;
