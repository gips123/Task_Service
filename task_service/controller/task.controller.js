const db = require("../db.js");
const { classifyText } = require("../classifier.js");
const { publishTaskCreated } = require("../messageBroker.js");

exports.createTask = async (req, res) => {
    try {
        const { user_id, description, priority, duration, deadline, is_locked } = req.body;

        if (!user_id || !description || !duration)
            return res.status(400).json({ error: "Missing fields" });

        const category = await classifyText(description);

        const sql = `
            INSERT INTO tasks (user_id, description, category, priority, duration_estimation, deadline, is_locked)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            user_id,
            description,
            category.label_name,
            priority || 2,
            duration,
            deadline || null,
            is_locked || false
        ]);

        const taskId = result.insertId;

        const taskData = {
            id: taskId,
            user_id,
            description,
            category: category.label_name,
            priority: priority || 'Medium',
            duration,
            deadline: deadline || null,
            is_locked: is_locked || false
        };

        console.log('========================================');
        console.log('Task baru ditambahkan:');
        console.log('ID:', taskId);
        console.log('User ID:', user_id);
        console.log('Description:', description);
        console.log('Category:', category.label_name);
        console.log('Priority:', priority || 'Medium');
        console.log('Duration:', duration, 'menit');
        console.log('Deadline:', deadline || 'Tidak ada');
        console.log('Locked:', is_locked || false);
        console.log('========================================');

        publishTaskCreated({
            id: taskId,
            user_id,
            category: category.label_name,
            duration,
            deadline: deadline || null
        }).catch(() => {});

        res.json({
            id: taskId,
            description,
            priority,
            category,
            duration,
            deadline,
            message: "Task berhasil dibuat!"
        });

    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};

exports.getAllTasks = async (req, res) => {
    const [data] = await db.query("SELECT * FROM tasks WHERE user_id = ?", [req.params.user_id]);
    res.json(data);
};

exports.getTaskById = async (req, res) => {
    const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
    res.json(rows[0] || null);
};

exports.updateTask = async (req, res) => {
    const { description, duration, priority, deadline, status } = req.body;

    await db.query(
        `UPDATE tasks SET description=?, duration_estimation=?, priority=?, deadline=?, status=? WHERE id=?`,
        [description, duration, priority, deadline, status || null, req.params.id]
    );

    console.log('Task diupdate - ID:', req.params.id, '| Description:', description, '| Status:', status || 'N/A');

    res.json({ message: "Task diupdate" });
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const validStatuses = ['Pending', 'In Progress', 'Completed', 'Overdue'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        await db.query(
            `UPDATE tasks SET status=? WHERE id=?`,
            [status || 'Pending', id]
        );

        res.json({ message: "Task status updated", status });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};

exports.deleteTask = async (req, res) => {
    await db.query("DELETE FROM tasks WHERE id=?", [req.params.id]);
    console.log('Task dihapus - ID:', req.params.id);
    res.json({ message: "Task dihapus" });
};
