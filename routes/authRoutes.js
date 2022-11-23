const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimitter = require("../middleware/loginLimitter");

router.use(loginLimitter);

router.post("/login", authController.login);
router.get("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;
