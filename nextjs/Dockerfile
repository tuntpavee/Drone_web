# Use a Node.js base image suitable for development
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package manager files
COPY package.json package-lock.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Copy the rest of your application's code into the container
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# The default command to run the development server
CMD ["npm", "run", "dev"]