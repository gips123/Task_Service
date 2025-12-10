import express from "express";
import { startSensorService, stopSensorService } from "../controller/sensorController.js";

const router = express.Router();

router.post("/start/:user_id", startSensorService);
router.post("/stop/:user_id", stopSensorService);

export default router;
