import express from "express";
import cors from "cors";
import sensorRoutes from "./routes/sensorRoutes.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("", sensorRoutes);

app.listen(PORT, () => {
    console.log(`Sensor Service berjalan pada port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});
