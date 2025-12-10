const db = require("../db.js");

exports.createWorkingSlot = async (req, res) => {
    try {
        const { user_id, working_days, start_time, end_time } = req.body;

        if (!user_id || !working_days || !start_time || !end_time) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const sql = `
            INSERT INTO working_slots (user_id, working_days, start_time, end_time)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            user_id,
            working_days,
            start_time,
            end_time
        ]);

        res.json({
            id: result.insertId,
            message: "Working slot created"
        });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};


exports.getWorkingSlotsByUser = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM working_slots WHERE user_id = ?",
            [req.params.user_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};


exports.updateWorkingSlot = async (req, res) => {
    try {
        const { working_days, start_time, end_time } = req.body;

        await db.query(
            `
            UPDATE working_slots
            SET working_days=?, start_time=?, end_time=?
            WHERE id=?
            `,
            [working_days, start_time, end_time, req.params.id]
        );

        res.json({ message: "Working slot updated" });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};


exports.deleteWorkingSlot = async (req, res) => {
    try {
        await db.query("DELETE FROM working_slots WHERE id=?", [req.params.id]);
        res.json({ message: "Working slot deleted" });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};
