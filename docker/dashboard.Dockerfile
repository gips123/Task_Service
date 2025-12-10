FROM node:18-alpine

WORKDIR /app

COPY dashboard_service/package.json ./
RUN npm install

COPY dashboard_service/ ./

EXPOSE 3002

CMD ["node", "server.js"]


