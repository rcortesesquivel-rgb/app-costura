# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies (including devDependencies for build)
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the server
RUN pnpm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm in production image
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Install drizzle-kit and tsx for migrations (needed at runtime for pre-deploy)
RUN pnpm add drizzle-kit tsx

# Copy built server from builder stage
COPY --from=builder /app/dist ./dist

# Copy drizzle config, schema, and migration files
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/drizzle ./drizzle

# Create entrypoint script that runs migrations then starts the server
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'echo "Running database migrations..."' >> /app/entrypoint.sh && \
    echo 'npx drizzle-kit migrate --config=drizzle.config.ts 2>&1 || echo "Migration warning (may be first run)"' >> /app/entrypoint.sh && \
    echo 'echo "Starting server..."' >> /app/entrypoint.sh && \
    echo 'exec node dist/index.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Expose the port for Railway's proxy
EXPOSE 3000

# Start with entrypoint that runs migrations first
CMD ["/app/entrypoint.sh"]
