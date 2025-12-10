import activeWin from "active-win";
import amqp from "amqplib";
import axios from "axios";

const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost";
const USER_ID = process.argv[2];

let channel;
let dynamicBlacklist = [];

async function fetchBlacklist(userId) {
    try {
        const res = await axios.get(`http://localhost:8000/blacklist/${userId}`);
        return res.data.map(item => item.app_name.toLowerCase());
    } catch (err) {
        return [];
    }
}

async function refreshBlacklist() {
    dynamicBlacklist = await fetchBlacklist(USER_ID);
    console.log(`[Sensor] Blacklist refreshed:`, dynamicBlacklist.length > 0 ? dynamicBlacklist : '[]');
}

async function connectRabbit() {
    try {
    const connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createChannel();
    await channel.assertExchange("tracker_events", "topic", { durable: true });
    } catch (err) {
        throw err;
    }
}

let lastApp = null;
let lastTitle = null;
let lastStatus = null;

async function startTracking() {
    setInterval(async () => {
        try {
            const win = await activeWin();
            if (!win) {
                return;
            }

            const appName = win.owner.name;
            const title = win.title;
            const appNameLower = appName.toLowerCase();
            const titleLower = title.toLowerCase();

            let status = "PRODUCTIVE";
            const isDistracted = dynamicBlacklist.some(keyword =>
                titleLower.includes(keyword) || appNameLower.includes(keyword)
            );

            if (isDistracted) status = "DISTRACTED";

            const appChanged = lastApp !== appName || lastStatus !== status;

            if (!appChanged) {
                return;
            }

            lastApp = appName;
            lastTitle = title;
            lastStatus = status;

            console.log(`[Sensor] [${status}] ${appName} - ${title.substring(0, 50)}`);

            const payload = {
                app_name: appName,
                window_title: title,
                status_detected: status,
                timestamp: new Date().toISOString()
            };

            if (!channel) {
                await connectRabbit();
                return;
            }

            channel.publish(
                "tracker_events",
                "activity.stream",
                Buffer.from(JSON.stringify(payload)),
                { persistent: false }
            );

        } catch (err) {
        }
    }, 1000);
}

(async () => {
    try {
    await connectRabbit();
    await refreshBlacklist();
    setInterval(refreshBlacklist, 10000);
    startTracking();
    } catch (err) {
        process.exit(1);
    }
})();
