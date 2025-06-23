FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install required tools
RUN npm install -g wait-on tsx && \
    apk add --no-cache postgresql-client

# Make scripts executable
RUN chmod +x scripts/*.sh 2>/dev/null || true

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Use Docker initialization script with auto-seed
CMD ["sh", "scripts/docker-init.sh"] 