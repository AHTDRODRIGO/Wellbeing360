const { sequelize } = require("../../../config/database");

const addEmployee = async (req, res) => {
  try {
    const {
      employee_no, // Added employee_no as primary key
      name,
      nic,
      date_of_birth,
      contact_number,
      weight,
      height,
      address,
      employee_type,
      department,
      designation,
      work_location,
      active_status,
    } = req.body;

    // Check if employee_no is provided
    if (!employee_no) {
      return res.status(400).json({ error: "Employee number is required" });
    }

    // Construct the raw SQL query
    const query = `
      INSERT INTO employee 
      (employee_no, name, nic, date_of_birth, contact_number, weight, height, address, employee_type, department, designation, work_location, active_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Execute the query with parameterized values
    await sequelize.query(query, {
      replacements: [
        employee_no, // Now required
        name,
        nic || null,
        date_of_birth,
        contact_number,
        weight || null,
        height || null,
        address,
        employee_type,
        department,
        designation,
        work_location,
        active_status !== undefined ? active_status : true, // Default to active
      ],
    });

    return res.status(201).json({ message: "Employee added successfully" });
  } catch (error) {
    console.error("Error adding employee:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getEmployees = async (req, res) => {
  try {
    // Raw SQL query to fetch all employees
    const query = `SELECT * FROM employee`;

    // Execute the query
    const [employees] = await sequelize.query(query);

    return res.status(200).json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getEmployeeByNumber = async (req, res) => {
  try {
    const { employee_no } = req.query; // Get employee_no from query parameters

    if (!employee_no) {
      return res.status(400).json({ error: "Employee number is required" });
    }

    // Raw SQL query to fetch employee by employee_no
    const query = `SELECT * FROM employee WHERE employee_no = ?`;

    // Execute the query
    const [employee] = await sequelize.query(query, {
      replacements: [employee_no],
    });

    if (employee.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json({ employee: employee[0] });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { employee_no } = req.query; // Get employee_no from query parameters

    if (!employee_no) {
      return res.status(400).json({ error: "Employee number is required" });
    }

    const {
      name,
      nic,
      date_of_birth,
      contact_number,
      weight,
      height,
      address,
      employee_type,
      department,
      designation,
      work_location,
      active_status,
    } = req.body;

    // Construct the raw SQL query
    const query = `
      UPDATE employee
      SET 
        name = ?, 
        nic = ?, 
        date_of_birth = ?, 
        contact_number = ?, 
        weight = ?, 
        height = ?, 
        address = ?, 
        employee_type = ?, 
        department = ?, 
        designation = ?, 
        work_location = ?, 
        active_status = ?
      WHERE employee_no = ?`;

    // Execute the query with parameterized values
    const [result] = await sequelize.query(query, {
      replacements: [
        name,
        nic || null,
        date_of_birth,
        contact_number,
        weight || null,
        height || null,
        address,
        employee_type,
        department,
        designation,
        work_location,
        active_status !== undefined ? active_status : true,
        employee_no, // Condition to match employee_no
      ],
    });

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addEmployee,
  getEmployees,
  getEmployeeByNumber,
  updateEmployee,
};
