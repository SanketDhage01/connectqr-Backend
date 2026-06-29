# Build stage or production runner
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Create directory for uploads
RUN mkdir -p uploads

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
