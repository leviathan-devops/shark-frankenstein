# 🦈 SHARK CLI - Stage 1 Docker Test Container
#
# Isolated environment for automated testing
# Guardian runs in SANDBOX mode by default

FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security testing
RUN addgroup -S shark && adduser -S shark -G shark

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create test directories
RUN mkdir -p /app/testing/reports /tmp/shark-sandbox && \
    chown -R shark:shark /app /tmp/shark-sandbox

# Set environment variables for Guardian
ENV GUARDIAN_LEVEL=sandbox
ENV GUARDIAN_SANDBOX_PATH=/tmp/shark-sandbox
ENV NODE_ENV=test

# Switch to non-root user
USER shark

# Default test runner
CMD ["./testing/stage1-docker/run-tests.sh"]
