# Base image
FROM node:16-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
ENV PORT=3000
EXPOSE $PORT

# Start application
CMD ["npm", "start"]
