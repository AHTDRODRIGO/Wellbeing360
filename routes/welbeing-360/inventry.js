const express = require("express");
const router = express.Router();
const {
  addMedicine,
} = require("../../controllers/wellbeing-360/inventry/add-items");
const {
  getAllMedicines,
  searchMedicineByName,
} = require("../../controllers/wellbeing-360/inventry/get");

router.post("/add", addMedicine);
router.get("/all", getAllMedicines);
router.get("/search", searchMedicineByName); 

module.exports = router;
