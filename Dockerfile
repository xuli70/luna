# Multi-stage build for production
# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (npm ci uses lockfile for exact versions)
RUN npm ci

# Copy source files
COPY . .

# Build the application
ENV BUILD_MODE=prod
ENV NODE_ENV=production
# Build manually: skip redundant npm install, use npx for binaries
RUN rm -rf node_modules/.vite-temp && \
    npx tsc -b && \
    npx vite build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
