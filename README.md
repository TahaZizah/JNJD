# JNJD 19th Edition — Registration Application

Full-stack registration app replacing Google Forms. Built with React/Vite (frontend), Spring Boot 3 (backend), PostgreSQL 16, MinIO (file storage), and Redis (rate limiting). All services containerized with Docker Compose.

## Quick Start

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env with your real secrets (SMTP password, JWT secret, admin credentials, etc.)
```

### 2. Launch all services

```bash
docker compose --env-file .env up --build -d
```

| Service        | URL                          |
|----------------|------------------------------|
| Frontend       | http://localhost             |
| Backend API    | http://localhost:8080        |
| MinIO Console  | http://localhost:9001        |
| Health Check   | http://localhost:8080/actuator/health |

### 3. Admin access

Navigate to `http://localhost/admin` and sign in with the `ADMIN_USERNAME` / `ADMIN_PASSWORD` from your `.env`.

---

## Development (without Docker)

### Backend

```bash
cd backend
# Requires Java 17, PostgreSQL 16, Redis, MinIO running locally
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

---

## Architecture

```
┌─────────────┐   HTTP/WS   ┌──────────────┐   JDBC    ┌───────────────┐
│  React App  │────────────▶│ Spring Boot  │──────────▶│  PostgreSQL   │
│ (Nginx/Vite)│             │   Backend    │           │     :5432     │
└─────────────┘             └──────┬───────┘           └───────────────┘
                                   │
                 ┌─────────────────┼──────────────────┐
                 ▼                 ▼                  ▼
          ┌──────────┐     ┌────────────┐     ┌────────────┐
          │  Redis   │     │   MinIO    │     │  SMTP      │
          │  :6379   │     │   :9000    │     │  (mail)    │
          └──────────┘     └────────────┘     └────────────┘
         Rate limiting     File storage      Email delivery
```

## Key Features

- **3-member team registration** with role assignment (Captain / Second / Third)
- **Official team mode**: requires school enrollment proof per member (uploaded directly to MinIO via presigned URL)
- **Rate limiting**: 5 submissions per IP per 10 minutes (Bucket4j + Redis)
- **Admin dashboard**: paginated list, filters, expandable rows, approve/reject/waitlist with audit trail
- **Async email**: approval notification to all 3 members with retry logic
- **JWT auth**: admin login stored in httpOnly cookie
- **Scalable**: stateless API, HikariCP pool (max 20), Tomcat max 200 threads

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/registrations` | — | Submit team registration |
| `GET`  | `/api/v1/registrations/presign?filename=&contentType=` | — | Get MinIO presigned PUT URL |
| `POST` | `/api/v1/admin/auth/login` | — | Admin login → JWT cookie |
| `GET`  | `/api/v1/admin/registrations` | JWT | Paginated list (filter by status, isOfficial) |
| `GET`  | `/api/v1/admin/registrations/{id}` | JWT | Full detail with members + history |
| `PATCH`| `/api/v1/admin/registrations/{id}/status` | JWT | Update status (triggers email on APPROVED) |
| `GET`  | `/api/v1/admin/registrations/{id}/proof-url?objectKey=` | JWT | Presigned GET URL for proof file |
| `GET`  | `/actuator/health` | — | Service health |
