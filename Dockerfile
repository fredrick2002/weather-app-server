# Use the official Node.js image as a base
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Set timezone to India (IST)
ENV TZ=Asia/Kolkata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port your app will run on (default to 3000 or change to your specific port)
EXPOSE 3000

# Start the Node.js application
CMD ["node", "index.js"]
