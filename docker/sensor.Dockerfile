FROM node:18-alpine

WORKDIR /app

COPY sensor_service/package.json ./
RUN npm install

COPY sensor_service/ ./

EXPOSE 3000

CMD ["node", "app.js"]


