const express = require("express");
const router = express.Router();
const {
  placeOrderByPrescription,
} = require("../../controllers/wellbeing-360/oder/add.js");
const {
  updateOrderStatus,
} = require("../../controllers/wellbeing-360/oder/üpdate.js");
const {
  getOrdersByEmployee,
  getAllOrders,
  getOrderById,
  getOrdersByEmployeeDetailed,getAllPaymentsWithEmployee
} = require("../../controllers/wellbeing-360/oder/get.js");

router.get("/all", getAllOrders);
router.post("/place", placeOrderByPrescription);
router.put("/status/:order_id", updateOrderStatus);
router.get("/by-employee", getOrdersByEmployee);
router.get("/by-oder-id", getOrderById);
router.get("/orders-by-employee", getOrdersByEmployeeDetailed);
router.get("/payments-all", getAllPaymentsWithEmployee);

module.exports = router;
