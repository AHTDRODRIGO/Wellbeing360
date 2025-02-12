const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Employee = sequelize.define(
  "Employee",
  {
    employee_no: {
      type: DataTypes.STRING(45), // Adjust length based on requirement
      primaryKey: true, // Set as primary key
      allowNull: false,
      unique: true, // Ensures uniqueness
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nic: {
      type: DataTypes.STRING(20),
      allowNull: true, // Some employees may not have an NIC
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be calculated dynamically instead of storing
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    employee_type: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    work_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Active by default
    },
  },
  {
    tableName: "employee",
    timestamps: false,
  }
);

module.exports = Employee;
