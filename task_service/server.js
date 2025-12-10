const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/task.routes.js");
const workingSlotRoutes = require("./routes/working.routes.js");
const distractionRoutes = require("./routes/distraction.routes.js");
const { connectRabbit } = require("./messageBroker.js");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/task", taskRoutes); 
app.use("/working-slots", workingSlotRoutes);
app.use("/blacklist", distractionRoutes);

connectRabbit().catch(() => {});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Task Service berjalan pada port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});
