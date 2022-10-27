const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.post("/", userController.createNewUser);
router.get("/:userId", userController.getUserDetails);
router.patch("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

module.exports = router;
