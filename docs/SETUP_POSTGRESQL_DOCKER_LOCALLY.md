

## Setup PostgresQL Locally using Docker

To start PostgreSQL locally using Docker, follow these steps:

### **1. Pull the PostgreSQL Docker Image**
If you haven't already pulled the PostgreSQL image, run:
```sh
docker pull postgres:latest
```

### **2. Run PostgreSQL in a Docker Container**
Run the following command to start a PostgreSQL container:
```sh
docker run --name postgres-local -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=mydatabase -p 5432:5432 -d postgres
```
- `--name postgres-local`: Names the container for easy reference.
- `-e POSTGRES_USER=myuser`: Sets the PostgreSQL username.
- `-e POSTGRES_PASSWORD=mypassword`: Sets the password.
- `-e POSTGRES_DB=mydatabase`: Creates a default database.
- `-p 5432:5432`: Maps the container's PostgreSQL port to your local machine.
- `-d postgres`: Runs in detached mode.

### **3. Check if the Container is Running**
```sh
docker ps
```

### **4. Connect to PostgreSQL**
#### Using `psql` from Docker
```sh
docker exec -it postgres-local psql -U myuser -d mydatabase
```

#### Using `psql` from Your Local Machine
If you have PostgreSQL installed, connect using:
```sh
psql -h localhost -U myuser -d mydatabase
```

#### Using `pgAdmin` or Other Clients
- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `myuser`
- **Password**: `mypassword`
- **Database**: `mydatabase`

### **5. Stop & Remove the Container (Optional)**
To stop the container:
```sh
docker stop postgres-local
```
To remove the container:
```sh
docker rm postgres-local
```