# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm ci

# Copy source code
COPY server ./

# Run tests
RUN npm run test || true

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY server ./

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
