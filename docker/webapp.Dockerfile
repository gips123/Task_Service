FROM node:18-alpine

WORKDIR /app

COPY web_app/package.json ./
RUN npm install

COPY web_app/ ./

EXPOSE 3003

CMD ["node", "server.js"]


