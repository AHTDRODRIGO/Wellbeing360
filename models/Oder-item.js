const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    medicine_id: {
      type: DataTypes.STRING(45),
      allowNull: true, // null if not in inventory
    },
    medicine_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    quantity_requested: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from_inventory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    from_outdoor_pharmacy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "order_items",
    timestamps: false,
  }
);

module.exports = OrderItem;
