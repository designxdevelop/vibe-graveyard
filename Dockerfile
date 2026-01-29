# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:22-slim AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

# Create data directory for SQLite
RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
