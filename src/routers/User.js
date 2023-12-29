var express = require("express");
const router = express.Router();

const user = require("../App/controllers/User.js");

router.post("/login", user.login);
router.post("/register", user.register);
module.exports = router;
