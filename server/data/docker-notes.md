## Installing Docker

### What is Docker?

Docker packages an application and its dependencies into an **image**. A **container** is a running instance of an image.

```
Dockerfile → docker build → Image → docker run → Container
```

- **Image** = blueprint/template
- **Container** = running instance
- **Registry** = place to store images (e.g., Docker Hub)
- **Volume** = persistent data
- **Network** = container-to-container communication

> Important distinction: container name and image name are different. A random container name such as `awesome_swartz` is not necessarily the image name.

### Installation Links

1. Download from: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
2. Install **Docker Desktop** (Windows/macOS) or Docker Engine (Linux).
3. Verify the installation:

```bash
docker --version
```

---

## Docker vs Virtual Machines

| Feature | Virtual Machine | Docker Container |
| --- | --- | --- |
| OS | Full guest OS per VM | Shares host kernel |
| Size | GBs | MBs |
| Boot time | Minutes | Seconds |
| Performance | Heavier | Near-native |
| Isolation | Strong (hardware-level) | Process-level |

Containers are not mini-VMs — they are isolated processes on the host kernel. This is why containers start in seconds and VMs take minutes.

---

## Essential Docker Commands

```bash
docker --version
docker info
docker help
docker ps
docker ps -a
docker images
docker pull IMAGE:TAG
docker run IMAGE
docker run -d IMAGE
docker stop CONTAINER
docker start CONTAINER
docker restart CONTAINER
docker rm CONTAINER
docker logs CONTAINER
docker exec -it CONTAINER bash
docker exec -it CONTAINER sh
docker inspect CONTAINER
docker stats
docker system df
```

- `docker ps` = only running containers
- `docker ps -a` = running + stopped containers
- `docker images` = local images

---

## docker run — Syntax and Options

```
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

```bash
docker run -d IMAGE
docker run -it IMAGE bash
docker run --name app IMAGE
docker run -p 3000:3000 IMAGE
docker run -e KEY=value IMAGE
docker run -v volume:/path IMAGE
docker run --network my-network IMAGE
```

- `-d` detached/background mode
- `-it` interactive terminal
- `--name` custom container name
- `-p` port mapping
- `-e` environment variable
- `-v` volume mount
- `--network` attaches container to a network

---

## docker exec — Enter a Running Container

```bash
docker exec -it awesome_swartz bash
```

If bash is unavailable:

```bash
docker exec -it awesome_swartz sh
```

Common service CLIs:

```bash
# Redis CLI
docker exec -it redis redis-cli

# MySQL client
docker exec -it mysql_db mysql -u root -p

# PostgreSQL
docker exec -it post_sql psql -U postgres
```

> Rule: `docker exec` needs at least a container name **and** a command. `docker exec -it redis` is incomplete because no command was supplied.

---

## Inside-Container Linux Practice

```bash
ls
pwd
mkdir hello
cd hello
touch h1.txt
cat h1.txt
ls -l
env
```

Write a file without vim:

```bash
cat > h1.txt
Hello Docker
# press Ctrl + D to save
```

> A minimal image may not contain vim or nano. `cat hello` gives an error when `hello` is a directory; use `ls hello` to inspect it.

---

## Images, Tags and Docker Hub

```bash
docker images

# Build an image
docker build -t myapp:latest .

# Tag for Docker Hub
docker tag myapp:latest souravkumar09/basic-project:v1

# Login and push
docker login
docker push souravkumar09/basic-project:v1
```

`myapp:latest` = repository name `myapp` + tag `latest`. Tags such as `v1`, `v2`, `1.0` are labels; `latest` is just a conventional tag, **not** an automatic version manager.

> Common mistake: `docker push` accepts one image reference. Do not give both the local and Docker Hub image names to `docker push`; use `docker tag` first.

---

## Dockerfile — Basic Pattern

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Typical flow: `Dockerfile` → `docker build` → image → `docker run`. `EXPOSE` documents the container port; actual host publishing is done with `-p`.

### COPY vs ADD

| Instruction | COPY | ADD |
| --- | --- | --- |
| Copies local files | Yes | Yes |
| Supports remote URLs | No | Yes |
| Auto-extracts tar files | No | Yes |
| Recommended | Always prefer | Only for auto-extracting tars |

### CMD vs ENTRYPOINT

| Instruction | Purpose |
| --- | --- |
| `CMD` | Default command; easily overridden by `docker run IMAGE <cmd>` |
| `ENTRYPOINT` | Fixed executable; arguments from `docker run` get appended |

Example:

```dockerfile
ENTRYPOINT ["ping"]
CMD ["google.com"]
```

`docker run myimg` pings google.com, while `docker run myimg facebook.com` pings facebook.com instead.

---

## Image Layers and Build Cache

Every instruction creates a layer, and Docker caches each layer:

```dockerfile
COPY package*.json ./   # changes rarely → cached most of the time
RUN npm install         # reruns ONLY when package.json changes
COPY . .                # changes often → kept last
```

This ordering is why we copy `package*.json` first and `npm install`, **then** copy the rest of the source. Changing one line of app code then only invalidates the cheap final layers — installs stay cached and builds finish in seconds.

---

## .dockerignore

Just like `.gitignore`, this keeps junk out of your build context and cache:

```
node_modules
dist
.git
.env
*.log
Dockerfile.dockerignore
```

Without ignoring `node_modules`, `COPY . .` copies thousands of unnecessary files into the image every build.

---

## Multi-Stage Builds (Production Best Practice)

Build tools stay in the builder stage; only the output ships in the final image:

```dockerfile
# Stage 1: build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve only static output
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

Result: no `node_modules`, no dev dependencies, no source maps — final image drops from ~1GB to tens of MBs.

---

## Port Mapping — Very Important

```
-p HOST_PORT:CONTAINER_PORT
```

```bash
docker run -p 3000:3000 myapp
docker run -p 3307:3306 mysql:latest
docker run -p 8080:8080 adminer
```

Example: `3307:3306` means Windows host port 3307 maps to MySQL's container port 3306. MySQL itself still listens on 3306 inside its container.

> Why `localhost:3306` does not show a web page: MySQL speaks the database protocol, not HTTP. Browser UIs such as Adminer expose an HTTP port (e.g., 8080).

---

## Volumes and Persistence

```bash
docker volume ls
docker volume create mydata
docker volume inspect mydata

docker run -d --name mysql_db \
  -v mysql_data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:latest
```

Containers are disposable. Database data should normally be stored in a volume so removing/recreating the container does not remove the database data.

---

## Bind Mounts

```bash
docker run -it --rm -v C:\Docker-Practice:/workspace ubuntu:latest bash
```

A bind mount connects a host directory to a container directory. On Windows, quote paths when needed. Bind mounts are great for live development; named volumes are great for databases.

---

## Docker Networks

```bash
docker network ls
docker network create mysql-network
docker network inspect mysql-network
docker network connect mysql-network mysql_db
docker network disconnect mysql-network mysql_db
```

Custom networks provide container-to-container DNS by container/service name. For example, Adminer can connect to MySQL using the hostname `mysql_db` when both are on `mysql-network`.

> The older `--link` mechanism is deprecated. Prefer a user-defined bridge network.

---

## Docker Compose — Main Idea

Docker Compose defines multiple services in a YAML file and starts them together:

```yaml
services:
  mongo:
    image: mongo:latest
  redis:
    image: redis:latest
  rabbitmq:
    image: rabbitmq:management
  backend:
    build: ./backend
    ports:
      - "5000:5000"
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

Compose commands:

```bash
docker compose up
docker compose up -d
docker compose down
docker compose ps
docker compose logs
docker compose logs -f backend
docker compose restart backend
docker compose build
docker compose pull
```

Compose service names also work as DNS hostnames inside the Compose network. A backend connects to Mongo using the service name rather than `localhost`.

### Environment Variables in Compose

```yaml
services:
  backend:
    build: .
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/blogwebsite
    env_file:
      - .env
```

Secrets stay in `.env` files (never committed) and get injected at runtime — never bake passwords into images.

---

## MySQL — Docker Setup

If host port 3306 is available:

```bash
docker run -d --name mysql_db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret mysql:latest
```

If host port 3306 is already occupied:

```bash
docker run -d --name mysql_db -p 3307:3306 -e MYSQL_ROOT_PASSWORD=secret mysql:latest
docker ps
docker logs mysql_db
```

In our practice session, host port 3306 was occupied, so the working mapping became `localhost:3307 → mysql_db:3306`.

### MySQL Login and SQL

```bash
docker exec -it mysql_db mysql -u root -p
# Password: secret
```

```sql
SHOW DATABASES;
CREATE DATABASE college;
USE college;
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  age INT,
  course VARCHAR(100)
);
SHOW TABLES;
```

Syntax correction practiced: `CREATE DATABASES college;` ❌ → `CREATE DATABASE college;` ✅.

---

## Adminer — Browser UI for MySQL

```bash
docker network create mysql-network
docker network connect mysql-network mysql_db
docker run -d --name adminer --network mysql-network -p 8080:8080 adminer:latest
```

Open the browser at `http://localhost:8080`.

Adminer login used in practice:

- System = MySQL/MariaDB
- Server = `mysql_db`
- Username = `root`
- Password = `secret`

> A previous attempt used `--link mysql_db:db`, but the custom-network setup uses `mysql_db` as the hostname. If Adminer says `db` cannot be resolved, use `mysql_db` and ensure both containers are on the same network.

---

## PostgreSQL — Docker Setup

```bash
docker run -d --name post_sql -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:latest
docker ps
docker logs post_sql
docker exec -it post_sql psql -U postgres
```

Common spelling corrections from practice: `postgres`, not `postgress`; `POSTGRES_PASSWORD`, not anything else; `--name`, not `-name`.

---

## Redis — Docker Practice

```bash
docker run -d --name redis -p 6379:6379 redis:latest
docker ps
docker exec -it redis redis-cli
```

Inside redis-cli:

```text
PING
PONG
SET name Sourav
GET name
DEL name
```

If the container name is not actually `redis`, use `docker ps -a` and the NAMES column to find the exact name. `docker exec -it redis bash` only works if a container named `redis` exists and its image contains bash.

---

## RabbitMQ — Docker Concepts

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

- Port **5672** = AMQP application port
- Port **15672** = management UI (`http://localhost:15672`)

Project concepts practiced: producer/consumer workers, queue constants, retry logic, dead-letter queue (DLQ), cron worker, AI worker, POTD consumer, CPOTD consumer, news consumer.

---

## MongoDB — Docker Concept

```bash
docker run -d --name mongo_db -p 27017:27017 mongo:latest
docker ps
docker logs mongo_db
```

In a Compose network, backend services must connect to Mongo by its Compose service name, not `localhost`, because `localhost` inside a container means that same container.

---

## Backend + Frontend Containers

```bash
# Example backend
docker build -t placementor-backend ./backend
docker run -d --name backend -p 5000:5000 placementor-backend:latest

# Example frontend
docker build -t placementor-frontend ./frontend
docker run -d --name frontend -p 3000:3000 placementor-frontend:latest
```

For production, frontend/backend images can be built separately and deployed through a registry and a hosting platform. Our project used Docker Compose locally and deployed components through Render, with Docker images also pushed to Docker Hub.

---

## Resource Limits and Health Checks

Limit resources per container:

```bash
docker run -d --name app --memory 512m --cpus 0.5 myapp:latest
```

Add health checks in Compose so dependent services wait correctly:

```yaml
services:
  mysql_db:
    image: mysql:latest
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5
  backend:
    build: ./backend
    depends_on:
      mysql_db:
        condition: service_healthy
```

---

## Cleaning Up Docker (Safe Housekeeping)

```bash
docker container prune          # remove all stopped containers
docker image prune              # remove dangling images
docker image prune -a           # remove all unused images
docker volume prune             # careful: removes unused volumes (data!)
docker network prune            # remove unused networks
docker system prune             # everything stopped/unused
docker system prune -a --volumes  # nuclear option — deletes volumes too!
```

> Never run `docker system prune -a --volumes` casually on a machine with databases you care about.

---

## Docker + CI/CD Concepts Practiced

Typical CI flow:

```
git push
  ↓
CI pipeline
  ↓
install dependencies
  ↓
run tests
  ↓
build
  ↓
docker build
  ↓
docker tag
  ↓
docker push
  ↓
deployment
```

Jenkins practice included an agent executing shell commands in a workspace. Docker is commonly inserted into this pipeline to produce repeatable deployment artifacts.

---

## Docker Troubleshooting Checklist

```bash
# 1. Is the container running?
docker ps
docker ps -a

# 2. What image does it use?
docker inspect CONTAINER

# 3. Why did it stop?
docker logs CONTAINER

# 4. Is the port occupied?
docker ps
# Windows:
netstat -ano | findstr :3306

# 5. Is the network present?
docker network ls
docker network inspect NETWORK

# 6. Is the image present?
docker images

# 7. Remove a stopped container
docker rm CONTAINER

# 8. Remove an image
docker rmi IMAGE:TAG
```

---

## Errors You Already Encountered

| Error | Meaning / Fix |
| --- | --- |
| `docker exec` requires at least 2 arguments | Container name + command required: `docker exec -it mysql_db bash` |
| `No such container: redis` | Actual container name was different or it did not exist. Use `docker ps -a` |
| `vim: command not found` | Image has no vim. Use `cat`, or edit on the host |
| `docker run requires at least 1 argument` | Image name missing: `docker run -d -p 3000:3000 myapp:latest` |
| `port 3306 already in use` | Host port occupied. Use `-p 3307:3306` or free the port |
| `container ... is not running` | Container exists but stopped. Check `docker ps -a` and `docker logs` |
| `network mysql-network not found` | Create it first: `docker network create mysql-network` |
| `container name already in use` | A container with that name exists. Remove it or pick another name |
| `Cannot link to a non running container` | The linked MySQL container was stopped |
| `Name does not resolve for db` | Use the real container/service name (`mysql_db`) and shared network |
| SQL Error 1064 near `databases` | `CREATE DATABASE college;`, not `CREATE DATABASES college;` |

---

## Docker Networking — The localhost Rule

One of the most important Docker concepts: inside a container, `localhost` means **that same container**. It does not mean your Windows host and does not mean another container.

```
Browser on Windows:
http://localhost:8080
        ↓
Adminer container
        ↓ (Server = mysql_db)
MySQL container :3306

Windows host:
localhost:3307 → MySQL container :3306
```

---

## Production-Oriented Project Notes

Our broader application infrastructure included MongoDB, Redis, RabbitMQ, backend, frontend, and PostgreSQL. Payment data was migrated toward PostgreSQL; Redis was used as a cache; RabbitMQ handled asynchronous work; workers consumed queued jobs.

```
Application
├── Frontend           :3000
├── Backend/API        :5000
├── MongoDB            :27017
├── PostgreSQL         :5432
├── Redis              :6379
└── RabbitMQ           :5672 / UI :15672
    ├── POTD queue
    ├── CPOTD queue
    └── News processing queue
    └── Email/retry/DLQ flow
```

A production deployment generally separates configuration/secrets from images, uses environment variables, persistent storage for databases, health checks, logs/monitoring, and reproducible image tags. **Do not bake passwords or API keys into a Dockerfile.**

---

## Final Real-World Stack to Remember

```
        Host mappings ≠ container ports

localhost:3000  → frontend
localhost:5000  → backend
localhost:8080  → Adminer
localhost:3307  → MySQL:3306
localhost:6379  → Redis:6379
localhost:5672  → RabbitMQ:5672
localhost:15672 → RabbitMQ UI
```

---

## One-Page Revision — Interview Questions

**What is Docker?** — A containerization platform used to package applications with dependencies into portable, isolated containers.

**Image vs container?** — Image is a template; container is a running instance of an image.

**What does `-d` mean?** — Detached/background mode.

**What does `-p 3307:3306` mean?** — Host port 3307 maps to container port 3306.

**Why not open MySQL 3306 in browser?** — MySQL is not an HTTP server.

**How do containers communicate?** — Through Docker networks using service/container DNS names.

**Why use volumes?** — To persist data beyond a container's lifecycle.

**What is Docker Compose?** — A declarative way to define and manage multiple related containers/services.

**How do you push an image?** — `docker tag` it with a Docker Hub namespace, then `docker push` that tag.

**Why does `docker exec` fail with 'container not running'?** — The target container is stopped; check `docker ps -a` and `docker logs`.

**What is a Dockerfile?** — A text file containing instructions to build an image.

**What is a registry?** — A repository service for storing/distributing container images, such as Docker Hub.

**COPY vs ADD?** — COPY just copies; ADD can also fetch URLs and auto-extract tars. Prefer COPY.

**CMD vs ENTRYPOINT?** — CMD provides defaults that are overridden easily; ENTRYPOINT pins the executable and appends args.

**Why multi-stage builds?** — Keeps compilers/build tools out of the final image; smaller and safer images.

---

## Conclusion

In this tutorial, we covered Docker end-to-end: the mental model, essential commands, images and registries, Dockerfiles and caching, ports, volumes, networks, Compose, real database setups (MySQL, PostgreSQL, Redis, RabbitMQ, MongoDB), troubleshooting, and production practices. With this foundation you can containerize any MERN-style stack confidently.
