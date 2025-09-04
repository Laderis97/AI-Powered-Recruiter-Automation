# Multi-stage build for AI-Powered Recruiter Automation
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
ENV DOCKER=true
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
ENV DOCKER=true
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copy views, public, and resumes directories
COPY --chown=nodejs:nodejs views ./views
COPY --chown=nodejs:nodejs public ./public
COPY --chown=nodejs:nodejs resumes ./resumes

# Copy necessary files
COPY --chown=nodejs:nodejs README.md ./
COPY --chown=nodejs:nodejs SECURITY.md ./
COPY --chown=nodejs:nodejs CONTRIBUTING.md ./

# Create uploads directory
RUN mkdir -p uploads resumes && chown -R nodejs:nodejs uploads resumes

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 1000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]
