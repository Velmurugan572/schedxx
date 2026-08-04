# ==========================================
# Multi-Stage Production Grade Dockerfile
# ==========================================

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies to generate client
RUN npm ci

# Copy database schema configuration
COPY prisma ./prisma/

# Generate Prisma Client engines for the Alpine environment
RUN npx prisma generate

# Copy application source code
COPY src ./src/

# Prune development dependencies to keep production footprint minimal
RUN npm prune --production

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Enforce production flags
ENV NODE_ENV=production

# Copy dependencies, generated prisma client binaries, and source code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Inform Docker that the application listens on port 3000 at runtime
EXPOSE 3000

# Start the application using Node's native runner
CMD ["node", "src/server.js"]
