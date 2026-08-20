FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Need OpenSSL for Prisma on debian slim
RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS production

# Need OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

CMD ["npm", "start"]
