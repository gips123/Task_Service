const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 8080;

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4000';
const TASK_URL = process.env.TASK_URL || 'http://localhost:8000';
const SCHEDULE_URL = process.env.SCHEDULE_URL || 'http://localhost:3001';
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3002';
const SENSOR_URL = process.env.SENSOR_URL || 'http://localhost:3000';
const CLASSIFIER_URL = process.env.CLASSIFIER_URL || 'http://localhost:5001';

const authenticateTokenGateway = (req, res, next) => {
    const publicPaths = ['/auth/login', '/auth/register'];
    const isPublicPath = publicPaths.some(p => req.path.startsWith(p));
    if (isPublicPath) return next();

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Unauthorized: Access token required." });

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired." });
        if (err.name === "JsonWebTokenError") return res.status(401).json({ error: "Invalid token." });
        return res.status(401).json({ error: "Authentication failed." });
    }
};

app.use('/auth', createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/auth/' },
}));

app.use(express.json());
app.use(authenticateTokenGateway);

app.use('/schedule-service', createProxyMiddleware({
    target: SCHEDULE_URL,
    changeOrigin: true,
    pathRewrite: { '^/schedule-service': '' },
}));

app.use('/task-service', createProxyMiddleware({
    target: TASK_URL,
    changeOrigin: true,
    pathRewrite: { '^/task-service': '' },
}));

app.use('/dashboard-service', createProxyMiddleware({
    target: DASHBOARD_URL,
    changeOrigin: true,
    pathRewrite: { '^/dashboard-service': '' },
}));

app.use('/sensor-service', createProxyMiddleware({
    target: SENSOR_URL,
    changeOrigin: true,
    pathRewrite: { '^/sensor-service': '' },
}));

app.use('/classify-service', createProxyMiddleware({
    target: CLASSIFIER_URL,
    changeOrigin: true,
    pathRewrite: { '^/classify-service': '' },
}));

app.listen(port, () => {
    console.log(`API Gateway berjalan pada port ${port}`);
    console.log(`URL: http://localhost:${port}`);
});
