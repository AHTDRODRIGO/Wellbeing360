const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Doctor = sequelize.define(
  "Doctor",
  {
    doctor_id: {
      type: DataTypes.STRING(45), // Unique identifier
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    specialization: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    work_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    availability: {
      type: DataTypes.STRING(255), // e.g., "Monday-Friday 9 AM - 5 PM"
      allowNull: false,
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "doctor",
    timestamps: false,
  }
);

module.exports = Doctor;
