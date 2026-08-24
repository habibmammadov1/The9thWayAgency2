# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:20-slim AS build

# Install OpenSSL (required by Prisma on debian-slim)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first so this layer is cached unless deps change
COPY package*.json ./
RUN npm ci --include=dev

COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Production runtime
# ─────────────────────────────────────────────
FROM node:20-slim AS production

# Install OpenSSL (required by Prisma at runtime)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

# Copy only what the runtime needs
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

# Run as non-root for security
USER node

EXPOSE 4000

CMD ["node", "dist/src/index.js"]
