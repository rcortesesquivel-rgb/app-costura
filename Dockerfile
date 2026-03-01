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

# Generate migration runner script
RUN echo 'const { execSync } = require("child_process"); try { console.log("Running migrations..."); execSync("npx drizzle-kit migrate --config=drizzle.config.ts", { stdio: "inherit" }); console.log("Migrations complete"); } catch(e) { console.warn("Migration warning:", e.message); }' > /app/dist/migrate.js

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm in production image
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Install drizzle-kit and tsx for migrations (needed at runtime)
RUN pnpm add drizzle-kit tsx

# Copy built server from builder stage
COPY --from=builder /app/dist ./dist

# Copy drizzle config, schema, and migration files
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000

# Run migrations then start server directly with node
CMD node dist/migrate.js && node dist/index.js
