// Bên trong file routes.js hoặc tương tự
const express = require("express");
const router = express.Router();
const userController = require("../App/controllers/User.js");

// Các route hiện tại
router.post("/login", userController.login);
router.post("/register", userController.register);
router.post("/check-token", userController.verifyToken);
router.post("/refresh-token", userController.refreshToken);

// Các route  cho quên mật khẩu
router.post("/send-verification-code", userController.sendVerificationCode);
router.post("/verify-verification-code", userController.verifyVerificationCode);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
