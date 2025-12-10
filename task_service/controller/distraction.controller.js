const db = require("../db.js");

exports.addBlacklist = async (req, res) => {
    try {
        const { user_id, app_name } = req.body;

        if (!user_id || !app_name) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const sql = `
            INSERT INTO distraction_blacklist (user_id, app_name)
            VALUES (?, ?)
        `;

        const [result] = await db.query(sql, [user_id, app_name]);

        res.json({
            id: result.insertId,
            message: "App ditambahkan ke blacklist"
        });

    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};


exports.getBlacklistByUser = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM distraction_blacklist WHERE user_id = ?",
            [req.params.user_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};


exports.deleteBlacklist = async (req, res) => {
    try {
        await db.query("DELETE FROM distraction_blacklist WHERE id=?", [req.params.id]);
        res.json({ message: "App berhasil dihapus!" });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};
