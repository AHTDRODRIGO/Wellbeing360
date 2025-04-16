const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PharmacyOrder = sequelize.define(
  "PharmacyOrder",
  {
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
      type: DataTypes.ENUM("hospital", "pharmaceutical"),
      allowNull: false,
    },
    delivery_type: {
      type: DataTypes.ENUM("pickup", "delivery"),
      allowNull: false,
    },
    order_status: {
      type: DataTypes.ENUM(
        "placed",
        "processing",
        "completed",
        "ready_to_pickup",
        "delivered"
      ),
      defaultValue: "placed",
    },
    placed_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "pharmacy_orders",
    timestamps: false,
  }
);

module.exports = PharmacyOrder;
