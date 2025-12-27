# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Install yarn using apk (Alpine package manager)
RUN apk add --no-cache yarn

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vueapp -u 1001

# Change ownership of the app directory
RUN chown -R vueapp:nodejs /app

# Switch to non-root user
USER vueapp

# Expose port 7001 (as configured in vite.config.mjs)
EXPOSE 7001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7001/ || exit 1

# Start development server
CMD ["yarn", "dev", "--host", "0.0.0.0"]
