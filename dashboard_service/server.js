const express = require('express');
const path = require('path');
const amqp = require('amqplib');
const WebSocket = require('ws');
const { WebSocketServer } = require('ws');
const http = require('http');

const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'tracker_events';
const ROUTING_KEY = 'activity.stream';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
wss.on('connection', () => {});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

async function startConsumer() {
    const conn = await amqp.connect(RABBIT_URL);
    const channel = await conn.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, ROUTING_KEY);

    channel.consume(q.queue, msg => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            broadcast(data);
            channel.ack(msg);
        }
    });
}

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Dashboard Service berjalan pada port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
startConsumer();
});
