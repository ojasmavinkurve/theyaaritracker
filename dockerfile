# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR C:\ojas\academics\finalproj

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
