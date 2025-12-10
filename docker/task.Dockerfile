FROM node:18-alpine

WORKDIR /app

COPY task_service/package.json ./
RUN npm install

COPY task_service/ ./

EXPOSE 8000

CMD ["node", "server.js"]


