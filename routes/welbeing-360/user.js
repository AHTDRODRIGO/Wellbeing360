const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth/authMiddleware"); // Import the auth middleware

// Import controllers
const {
  UpdateRoleBasedPermissions,
} = require("../../controllers/wellbeing-360/rolebasedpermissions/updateRoleBasedPermissions");

const {
  createUser,
  AddUserRole,
  GetRoles,
  resetPassword,
  deleteUserRole,
  deleteUser,
} = require("../../controllers/wellbeing-360/user/createUser");

const {
  createTFUser,
  addTFUserRole,
  getTFRoles,
  resetTFUserPassword,
} = require("../../controllers/wellbeing-360/user/tf_user");

const {
  updateUser,
  updateRolePermissions,
} = require("../../controllers/wellbeing-360/user/updateUser");

const {
  getUserByIDORName,
  getAllUsers,
  getPermissionsByRoleId,
} = require("../../controllers/wellbeing-360/user/getUser");

const { loginUser } = require("../../controllers/wellbeing-360/user/userLogin"); // Import loginUser
const { logoutCurrentUser } = require("../../controllers/wellbeing-360/user/logoutUser"); // Import logoutCurrentUser

// Public routes (no auth required)
router.post("/userLogin", loginUser);
// router.post("/createTFUser", authMiddleware, createTFUser);

// Protected routes (auth required)
router.post("/createUser", createUser);
router.post("/createTFUser", createTFUser);
router.post("/addTFUserRole", addTFUserRole);
router.get("/getTFRoles", getTFRoles);
router.put("/resetTFUserPassword", resetTFUserPassword);
router.delete("/deleteUserRole", deleteUserRole);
router.delete("/deleteUser", deleteUser);

router.put("/updateUser", updateUser);
router.post("/userLogout", logoutCurrentUser);
router.post("/addUserRole", AddUserRole);
router.get("/roles", GetRoles);
router.get("/getUserByIDORName", getUserByIDORName);
router.get("/getAllUsers", getAllUsers);
router.get("/getPermissionsByRoleId", getPermissionsByRoleId);
router.put("/resetPassword", resetPassword);
router.put(
  "/UpdateRoleBasedPermissions",

  updateRolePermissions
);

module.exports = router;
