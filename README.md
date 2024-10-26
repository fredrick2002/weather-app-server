## Application 2: Real-Time Data Processing System for Weather Monitoring with Rollups and Aggregates (Server)

### Prerequisites
- Ensure you have [Docker](https://www.docker.com/get-started) installed on your system.
- Confirm that port **3000** is free for the server application.

### Setup Instructions

1. **Download the Environment Configuration**
   - Before starting, download the **`.env`** file from the link provided in the PDF. Due to security reasons, the `.env` file cannot be uploaded here.
   - Paste the downloaded **`.env`** file into the project directory.

2. **Open the Terminal**
   - Navigate to the project directory where the server code resides. Open your terminal in that directory.

3. **Build the Docker Image**
   Execute the following command to build the Docker image for the server application. This process may take some time:
   ```bash
   docker build -t weather-app-server .
   ```

4. **Verify Port Availability**
   Before running the Docker container, ensure that port **3000** is not in use. You can check for active connections using:
   - On **Linux/Mac**:
     ```bash
     lsof -i :3000
     ```
   - On **Windows**:
     ```bash
     netstat -ano | findstr :3000
     ```

5. **Run the Docker Image**
   Start the server application by running the following command, mapping port **3000** on your host to port **3000** in the container:
   ```bash
   docker run -p 3000:3000 weather-app-server
   ```

6. **Server Status**
   That's it! The server for Application 2 (Weather Monitoring Client) is now running and ready to process requests.

### Notes
- If you encounter any issues during the build process, check the terminal logs for errors and ensure that Docker has permission to access the necessary resources.
- To stop the running Docker container, you can use `Ctrl + C` in the terminal where it's running or find the container ID using:
  ```bash
  docker ps
  ```
  Then stop it using:
  ```bash
  docker stop <container-id>
  ```