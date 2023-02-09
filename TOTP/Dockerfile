# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install

# Copy the application code to the container
COPY src ./src

COPY dist ./dist

COPY config ./config

# Expose port 3000 for the Node.js application
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]