const express = require("express");
const router = express.Router();
const controller = require("../controller/distraction.controller.js");

router.post("/", controller.addBlacklist);
router.get("/:user_id", controller.getBlacklistByUser);
router.delete("/:id", controller.deleteBlacklist);

module.exports = router;
