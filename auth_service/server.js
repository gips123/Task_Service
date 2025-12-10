const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes.js");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Auth Service Running" });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Auth Service berjalan pada port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});

