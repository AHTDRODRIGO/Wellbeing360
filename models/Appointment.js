const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Appointment = sequelize.define(
  "Appointment",
  {
    appointment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_no: {
      type: DataTypes.STRING(45), // Employee as the patient
      allowNull: false,
      references: {
        model: "employee",
        key: "employee_no",
      },
    },
    doctor_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: "doctor",
        key: "doctor_id",
      },
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "doctor_schedule",
        key: "schedule_id",
      },
      onDelete: "CASCADE", // If schedule is removed, appointments are also deleted
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    appointment_status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "appointment",
    timestamps: false,
  }
);

module.exports = Appointment;
