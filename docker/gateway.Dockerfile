FROM node:18-alpine

WORKDIR /app

COPY gateway_service/package.json ./
RUN npm install

COPY gateway_service/ ./

EXPOSE 8080

CMD ["node", "gateway.js"]

