const express = require("express");
const router = express.Router();
const controller = require("../controller/auth.controller.js");
const { authenticateToken } = require("../middleware/auth.middleware.js");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/verify", authenticateToken, controller.verifyToken);

module.exports = router;

