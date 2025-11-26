# Use Node 18 Alpine
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build Next.js
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
