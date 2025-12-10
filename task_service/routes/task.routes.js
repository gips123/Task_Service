const express = require("express");
const router = express.Router();
const controller = require("../controller/task.controller");

router.post("/", controller.createTask);
router.get("/user/:user_id", controller.getAllTasks);
router.get("/:id", controller.getTaskById);
router.put("/:id", controller.updateTask);
router.patch("/:id/status", controller.updateTaskStatus);
router.delete("/:id", controller.deleteTask);

module.exports = router;
