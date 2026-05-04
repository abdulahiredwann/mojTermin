FROM node:20-alpine

WORKDIR /app

# Install Prisma dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Create upload directory
RUN mkdir -p upload/Images/Cars upload/Images/KYC

# Expose port (will be mapped by docker-compose)
EXPOSE 4000

# Start the server
CMD ["node", "index.js"]
