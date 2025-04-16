const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PrescriptionItem = sequelize.define(
  "PrescriptionItem",
  {
    item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    prescription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    medicine_id: {
      type: DataTypes.STRING(45),
      allowNull: true, // can be null if not from inventory
    },
    medicine_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    quantity_prescribed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from_inventory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    dosage_instructions: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "prescription_items",
    timestamps: false,
  }
);

module.exports = PrescriptionItem;
