const express = require("express");
const router = express.Router();
const slotController = require("../controller/working.controller.js");

router.post("/", slotController.createWorkingSlot);
router.get("/:user_id", slotController.getWorkingSlotsByUser);
router.put("/:id", slotController.updateWorkingSlot);
router.delete("/:id", slotController.deleteWorkingSlot);

module.exports = router;