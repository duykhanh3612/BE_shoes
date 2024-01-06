var express = require("express");
const router = express.Router();

const task = require("../App/controllers/Task.js");

router.post("/create", task.createTask);
router.patch("/update", task.updateTask);
router.delete("/delete/:status/:index", task.deleteTask);

module.exports = router;
