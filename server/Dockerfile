# Use official Node.js slim image
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy rest of server source
COPY . .

# Cloud Run requires port 8080
EXPOSE 8080
ENV PORT=8080

# Start the Express server
CMD ["node", "index.js"]
