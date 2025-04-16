const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Prescription = sequelize.define(
  "Prescription",
  {
    prescription_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    doctor_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    employee_no: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    issued_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "prescription",
    timestamps: false,
  }
);

module.exports = Prescription;
