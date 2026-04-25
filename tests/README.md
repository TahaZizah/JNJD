# JNJD Testing Suite

This directory contains the complete testing infrastructure for the JNJD 19th Edition Registration Platform. All scripts are written against the **actual** API endpoints and data contracts of the application.

---

## Directory Structure

```
tests/
├── k6/
│   ├── load-test-spike.js    # Spike test — simulates registration window opening
│   ├── soak-test.js          # Soak test — 8h sustained load for leak detection
│   └── stress-test.js        # Stress test — ramps to 3000 VUs to find breaking point
└── postman/
    └── JNJD_Registration_API.postman_collection.json  # Full API test suite

backend/src/test/java/com/jnjd/registration/
├── controller/
│   ├── RegistrationControllerTest.java      # MockMvc HTTP layer tests
│   └── RegistrationIntegrationTest.java     # Testcontainers full-stack integration tests
└── service/
    ├── RegistrationServiceTest.java         # (existing) Basic service unit tests
    └── RegistrationServiceExtendedTest.java # Extended service tests (all business rules)

frontend/src/test/
└── schema.validation.test.ts  # Vitest — Zod schema + file validation unit tests
```

---

## Prerequisites

### k6 (Load Testing)
```bash
brew install k6
```

### Newman (Postman CLI)
```bash
npm install -g newman newman-reporter-htmlextra
```

### Docker (Testcontainers)
Docker Desktop must be running for the Java integration tests.

---

## Running the Tests

### 1. Frontend Unit Tests (Vitest)
```bash
cd frontend
npm test
```

### 2. Backend Unit Tests (JUnit 5 / Mockito)
```bash
cd backend
./mvnw test
```

### 3. Backend Integration Tests (Testcontainers — requires Docker)
```bash
cd backend
./mvnw verify  # Runs *IntegrationTest.java via maven-failsafe-plugin
```

### 4. API Tests (Postman / Newman)

> Make sure the full stack is running: `docker-compose up`

```bash
newman run tests/postman/JNJD_Registration_API.postman_collection.json \
  --env-var BASE_URL=http://localhost:8080 \
  --env-var ADMIN_USER=admin \
  --env-var ADMIN_PASS=<your-admin-password> \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export results/postman-report.html
```

### 5. k6 Load Tests

> Make sure the full stack is running: `docker-compose up`

**Spike Test (The "Stampede" — run before launch)**
```bash
k6 run tests/k6/load-test-spike.js --env BASE_URL=http://localhost:8080
```

**Stress Test (Find the breaking point)**
```bash
mkdir -p results
k6 run tests/k6/stress-test.js \
  --env BASE_URL=http://localhost:8080 \
  --out json=results/stress-$(date +%Y%m%d_%H%M%S).json
```

**Soak Test (8-hour stability — run overnight)**
```bash
k6 run tests/k6/soak-test.js \
  --env BASE_URL=http://localhost:8080 \
  --out influxdb=http://localhost:8086/k6  # Optional: pipe to InfluxDB+Grafana
```

---

## Test Scenario Coverage Map

| Test ID | Scenario                                    | Tool                       | File                                    |
|---------|---------------------------------------------|----------------------------|-----------------------------------------|
| UP-01   | Concurrent large file presigning             | k6 spike test              | `k6/load-test-spike.js`                 |
| UP-04   | Invalid file extension rejected              | Postman + Vitest + Testcon.| `postman/`, `schema.validation.test.ts` |
| UP-04   | Invalid content-type rejected               | Postman + Testcontainers   | `postman/`, `RegistrationIntegTest.java`|
| DP-01   | 50 concurrent registrations — zero data loss | Testcontainers             | `RegistrationIntegrationTest.java`      |
| DP-04   | Idempotency / double-submit protection       | Postman                    | `postman/`                              |
| REG-01  | Happy path — unofficial team                 | Postman + JUnit + k6       | All                                     |
| REG-02  | Happy path — official team with proof keys   | Postman + JUnit            | `postman/`, service extended test       |
| VAL-01  | Missing teamName → 400                       | JUnit (MockMvc)            | `RegistrationControllerTest.java`       |
| VAL-02  | 2 members → 400                             | JUnit + Vitest             | Controller test + schema test           |
| VAL-03  | Invalid Moroccan phone → 400                | JUnit + Vitest             | Controller test + schema test           |
| VAL-04  | Official missing proof → 4xx                | JUnit + Postman            | Service + controller + postman          |
| VAL-05  | tshirtSize OTHER without custom → 4xx        | JUnit + Vitest             | Service extended + schema test          |
| SEC-01  | Rate limit exceeded → 429                   | JUnit (MockMvc)            | `RegistrationControllerTest.java`       |
| ADMIN   | Full admin CRUD + status history             | Postman                    | `postman/`                              |
| PERF    | Spike — 200 VUs, 2 min                      | k6                         | `k6/load-test-spike.js`                 |
| PERF    | Soak — 50 VUs, 8 hours                      | k6                         | `k6/soak-test.js`                       |
| PERF    | Stress — ramp to 3000 VUs                   | k6                         | `k6/stress-test.js`                     |

---

## SLO Thresholds

| Metric                              | Target         |
|-------------------------------------|----------------|
| Registration POST p(95) latency     | < 2,000ms      |
| Presigned URL GET p(95) latency     | < 500ms        |
| HTTP error rate (spike test)        | < 2%           |
| HTTP error rate (soak test)         | < 1%           |
| JVM Heap during soak                | < 512 MB       |

---

## Monitoring During Load Tests

Run alongside k6 to observe system health:

```bash
# PostgreSQL active connections
docker exec jnjd-db-1 psql -U $POSTGRES_USER -d $POSTGRES_DB \
  -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Redis client count (Bucket4j rate limiter)
docker exec jnjd-redis-1 redis-cli INFO clients

# Spring Boot JVM metrics
curl http://localhost:8080/actuator/metrics/jvm.memory.used
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
```
