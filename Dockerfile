FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the client application
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]