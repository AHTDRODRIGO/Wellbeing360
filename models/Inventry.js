const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Medicine = sequelize.define(
  "Medicine",
  {
    medicine_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    unit_type: {
      type: DataTypes.ENUM("pill", "bottle", "syrup", "capsule", "injection"),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    dosage_frequency: {
      type: DataTypes.STRING(100), // e.g. "2 times/day"
      allowNull: true,
    },
    quantity_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    availability_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // true = available
    },
    created_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "medicine",
    timestamps: true, // To track createdAt, updatedAt automatically
  }
);

module.exports = Medicine;
