FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install wait-on globally and postgresql-client for psql
RUN npm install -g wait-on tsx && \
    apk add --no-cache postgresql-client

# Make scripts executable
RUN chmod +x scripts/*.sh 2>/dev/null || true

# Expose port
EXPOSE 3001

# Default command (can be overridden)
CMD ["npx", "tsx", "src/index.ts"] 