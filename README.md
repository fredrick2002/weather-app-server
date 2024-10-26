## Application 2 : Real-Time Data Processing System for Weather Monitoring with Rollups and Aggregates (Server)

1. Before Starting download the .env file **(Link Provided in PDF)** for server and paste it in the project file (Cannot upload .env file due to Security Reasons)
   
2. After that open up the terminal from that directory

3. Then type this command to build the docker image(Takes some time to build)

```
docker build -t weather-app-server .
```

4.Make sure port 3000 is free 

5. run the image in docker

```
docker run -p 3000:3000 weather-app-server
```

6. That's it now the server for application 2 (weather-app-client) is running 
