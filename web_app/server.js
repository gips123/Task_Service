const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Web App berjalan pada port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});

