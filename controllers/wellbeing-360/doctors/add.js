const { sequelize } = require("../../../config/database");

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      specialization,
      contact_number,
      email,
      work_location,
      availability,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !specialization ||
      !contact_number ||
      !email ||
      !work_location ||
      !availability
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Step 1: Get latest doctor_id
    const [latest] = await sequelize.query(
      `SELECT doctor_id FROM doctor ORDER BY doctor_id DESC LIMIT 1`
    );

    let newIdNumber = 1;

    if (latest.length > 0) {
      const lastId = latest[0].doctor_id; // e.g., "DOC0002"
      const numberPart = parseInt(lastId.replace("DOC", ""));
      newIdNumber = numberPart + 1;
    }

    const doctor_id = `DOC${newIdNumber.toString().padStart(4, "0")}`; // e.g., "DOC0003"

    // Step 2: Insert doctor with default active_status = true
    const insertQuery = `
      INSERT INTO doctor 
      (doctor_id, name, specialization, contact_number, email, work_location, availability, active_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    await sequelize.query(insertQuery, {
      replacements: [
        doctor_id,
        name,
        specialization,
        contact_number,
        email,
        work_location,
        availability,
        true, // Set active_status = true by default
      ],
    });

    return res.status(200).json({
      message: "Doctor added successfully",
      doctor_id,
    });
  } catch (error) {
    console.error("Error adding doctor:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getDoctors = async (req, res) => {
  try {
    const query = `SELECT * FROM doctor`;

    const [doctors] = await sequelize.query(query);

    return res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { doctor_id } = req.query;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const query = `SELECT * FROM doctor WHERE doctor_id = ?`;

    const [doctor] = await sequelize.query(query, {
      replacements: [doctor_id],
    });

    if (doctor.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    return res.status(200).json({ doctor: doctor[0] });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const updateDoctor = async (req, res) => {
  try {
    const { doctor_id } = req.query;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const {
      name,
      specialization,
      contact_number,
      email,
      work_location,
      availability,
      active_status,
    } = req.body;

    const query = `
        UPDATE doctor
        SET 
          name = ?, 
          specialization = ?, 
          contact_number = ?, 
          email = ?, 
          work_location = ?, 
          availability = ?, 
          active_status = ?
        WHERE doctor_id = ?`;

    const [result] = await sequelize.query(query, {
      replacements: [
        name,
        specialization,
        contact_number,
        email,
        work_location,
        availability,
        active_status !== undefined ? active_status : true,
        doctor_id, // Condition to match doctor_id
      ],
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    return res.status(200).json({ message: "Doctor updated successfully" });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteDoctor = async (req, res) => { 
  try {
    const { doctor_id } = req.query;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const query = `DELETE FROM doctor WHERE doctor_id = ?`;

    const [result] = await sequelize.query(query, {
      replacements: [doctor_id],
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    return res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  getDoctorById,
  deleteDoctor, 
  updateDoctor,
};
