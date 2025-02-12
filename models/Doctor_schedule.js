const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DoctorSchedule = sequelize.define(
  "DoctorSchedule",
  {
    schedule_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    doctor_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: "doctor",
        key: "doctor_id",
      },
      onDelete: "CASCADE", // Delete schedules if doctor is removed
    },
    date: {
      type: DataTypes.DATEONLY, // Format: YYYY-MM-DD
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME, // Format: HH:MM:SS
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME, // Format: HH:MM:SS
      allowNull: false,
    },
    max_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10, // Default number of patients per session
    },
    available_slots: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "doctor_schedule",
    timestamps: false,
  }
);

module.exports = DoctorSchedule;
