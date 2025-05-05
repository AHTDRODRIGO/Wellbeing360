const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const http = require("http");
const { sequelize } = require("./config/database");
const socketConfig = require("./config/socket"); // Socket.IO helper for initialization

// Import Routes
const EmployeeRoutes = require("./routes/welbeing-360/employee.js");
const DoctorRoutes = require("./routes/welbeing-360/doctors.js");
const Appointment = require("./routes/welbeing-360/appointment.js");
const Inventrry = require("./routes/welbeing-360/inventry.js");
const Prescription = require("./routes/welbeing-360/prescription.js");
const Order = require("./routes/welbeing-360/oder.js");

// Import Models
// require("./models/Employee");
// require("./models/Doctors.js");
// require("./models/Doctor_schedule.js");
// require("./models/Appointment.js");
// require("./models/Inventry.js");
// require("./models/Prescription.js");
// require("./models/Prescription-items.js");
// require("./models/Payment.js");

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketConfig.init(server); // Initialize Socket.IO with the HTTP server

const PORT = process.env.PORT || 8599;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Sync all models with the database
// sequelize
//   .sync({ alter: true })
//   .then(() => console.log("All models synchronized successfully."))
//   .catch((error) => console.error("Error syncing models:", error));

// Define Routes
app.use("/v1/wellbeing360/employees", EmployeeRoutes);
app.use("/v1/wellbeing360/doctors", DoctorRoutes);
app.use("/v1/wellbeing360/appointment", Appointment);
app.use("/v1/wellbeing360/inventry", Inventrry);
app.use("/v1/wellbeing360/prescription", Prescription);
app.use("/v1/wellbeing360/oder", Order);

// 404 Error Handling
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
