const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

// router.use(verifyJWT);

router.post("/", userController.createNewUser);
router.get("/", verifyJWT, userController.getAllUsers);
router.get("/:userId", verifyJWT, userController.getUserDetails);
router.patch("/:userId", verifyJWT, userController.updateUser);
router.delete("/:userId", verifyJWT, userController.deleteUser);

module.exports = router;
