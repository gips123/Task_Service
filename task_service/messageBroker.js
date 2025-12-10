const amqp = require("amqplib");

let channel = null;
const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost";

async function connectRabbit() {
    const connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createChannel();
    await channel.assertExchange("task_events", "topic", { durable: true });
}

async function publishTaskCreated(taskData) {
     if (!channel) {
        setTimeout(() => publishTaskCreated(taskData), 2000);
        return;
    }

    channel.publish(
        "task_events",
        "task.created",
        Buffer.from(JSON.stringify(taskData)),
        { persistent: true }
    );
}

module.exports = { connectRabbit, publishTaskCreated };
