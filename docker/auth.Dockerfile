FROM node:18-alpine

WORKDIR /app

COPY auth_service/package.json ./
RUN npm install

COPY auth_service/ ./

EXPOSE 4000

CMD ["node", "server.js"]


