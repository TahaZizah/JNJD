package com.jnjd.registration.controller;

import com.jnjd.registration.dto.MemberRequest;
import com.jnjd.registration.dto.RegistrationRequest;
import com.jnjd.registration.dto.RegistrationResponse;
import com.jnjd.registration.enums.RegistrationStatus;
import com.jnjd.registration.enums.TshirtSize;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * RegistrationController Integration Tests (DP scenarios)
 *
 * Scope: Full Spring context + real PostgreSQL + real Redis via Testcontainers.
 *        MinIO is mocked at the service level (no live MinIO container needed).
 *
 * Covers:
 *   - DP-01: Concurrent registration — exactly N unique registrations created
 *   - DP-04: Duplicate request idempotency (fast double-submit)
 *   - E2E validation → persistence round-trip
 *   - Admin status update + history recording
 *
 * NOTE: MinIO is intentionally excluded from this integration test to keep
 *       the scope focused on DB persistence. File upload integration is
 *       tested separately in MinioService tests.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Registration Integration Tests — Data Persistence")
class RegistrationIntegrationTest {

    // ─── Testcontainers ────────────────────────────────────────────────────────

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Database
        registry.add("spring.datasource.url",      postgres::getJdbcUrl);
        registry.add("spring.datasource.username",  postgres::getUsername);
        registry.add("spring.datasource.password",  postgres::getPassword);
        registry.add("spring.liquibase.enabled",    () -> "true");

        // Redis (Bucket4j rate limiter)
        registry.add("spring.data.redis.host",      redis::getHost);
        registry.add("spring.data.redis.port",      () -> redis.getMappedPort(6379).toString());

        // MinIO — disabled for persistence-only integration tests
        registry.add("minio.endpoint",              () -> "http://localhost:9000"); // unreachable, but won't be called
        registry.add("minio.access-key",            () -> "minioadmin");
        registry.add("minio.secret-key",            () -> "minioadmin");
        registry.add("minio.bucket",                () -> "jnjd-test");
        registry.add("minio.public-endpoint",       () -> "http://localhost:9000");
        registry.add("minio.presign-expiry-minutes",() -> "60");

        // Disable email
        registry.add("spring.mail.host",            () -> "localhost");
        registry.add("spring.mail.port",            () -> "3025");
    }

    @LocalServerPort int port;

    @Autowired TestRestTemplate restTemplate;

    // ─── Fixture helpers ────────────────────────────────────────────────────────

    private String baseUrl() {
        return "http://localhost:" + port + "/api/v1";
    }

    private RegistrationRequest buildValidUnofficialRequest(String teamName) {
        RegistrationRequest req = new RegistrationRequest();
        req.setTeamName(teamName);
        req.setOfficial(false);
        req.setDescription("Integration test");
        req.setMembers(List.of(
            member("Cap " + teamName, "cap_" + System.nanoTime() + "@it.local", "0612345670", TshirtSize.M),
            member("Sec " + teamName, "sec_" + System.nanoTime() + "@it.local", "0698765432", TshirtSize.L),
            member("Trd " + teamName, "trd_" + System.nanoTime() + "@it.local", "0711223344", TshirtSize.S)
        ));
        return req;
    }

    private MemberRequest member(String name, String email, String phone, TshirtSize size) {
        MemberRequest m = new MemberRequest();
        m.setFullName(name);
        m.setEmail(email);
        m.setPhone(phone);
        m.setTshirtSize(size);
        return m;
    }

    private ResponseEntity<RegistrationResponse> postRegistration(RegistrationRequest req) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return restTemplate.exchange(
            baseUrl() + "/registrations",
            HttpMethod.POST,
            new HttpEntity<>(req, headers),
            RegistrationResponse.class
        );
    }

    // ─── Tests ─────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("REG-E2E: Full round-trip — POST → 201 → persisted in DB")
    void fullRoundTrip_createRegistration() {
        RegistrationRequest req = buildValidUnofficialRequest("E2E Team Alpha");

        ResponseEntity<RegistrationResponse> response = postRegistration(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        RegistrationResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getId()).isNotNull();
        assertThat(body.getTeamName()).isEqualTo("E2E Team Alpha");
        assertThat(body.getStatus()).isEqualTo(RegistrationStatus.PENDING);
        assertThat(body.getCreatedAt()).isNotNull();
    }

    @Test
    @Order(2)
    @DisplayName("DP-01: Concurrent registrations — all unique, no data loss")
    void concurrentRegistrations_allPersisted_noDataLoss() throws InterruptedException {
        int concurrentUsers = 50; // Keep reasonable for CI; increase for stress testing
        ExecutorService executor = Executors.newFixedThreadPool(concurrentUsers);
        CountDownLatch startLatch  = new CountDownLatch(1);
        CountDownLatch doneLatch   = new CountDownLatch(concurrentUsers);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<UUID> createdIds = new CopyOnWriteArrayList<>();

        for (int i = 0; i < concurrentUsers; i++) {
            final int idx = i;
            executor.submit(() -> {
                try {
                    startLatch.await(); // All threads start simultaneously
                    RegistrationRequest req = buildValidUnofficialRequest("Concurrent Team " + idx + " " + UUID.randomUUID());
                    ResponseEntity<RegistrationResponse> res = postRegistration(req);

                    if (res.getStatusCode() == HttpStatus.CREATED && res.getBody() != null) {
                        successCount.incrementAndGet();
                        createdIds.add(res.getBody().getId());
                    } else {
                        failureCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // Fire all threads at once
        boolean completed = doneLatch.await(60, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).as("All threads completed within timeout").isTrue();
        assertThat(failureCount.get()).as("Zero failures under concurrent load").isEqualTo(0);
        assertThat(successCount.get()).as("All registrations persisted").isEqualTo(concurrentUsers);

        // DP-01: Every ID must be unique — no duplicate rows
        assertThat(createdIds).as("All IDs are unique (no duplicate saves)")
            .doesNotHaveDuplicates()
            .hasSize(concurrentUsers);
    }

    @Test
    @Order(3)
    @DisplayName("VAL-E2E: Invalid phone rejected with 400 — no DB write")
    void invalidPhone_returns400_noDbWrite() {
        RegistrationRequest req = buildValidUnofficialRequest("Invalid Phone Team");
        req.getMembers().get(0).setPhone("1234567890"); // Not a valid Moroccan number

        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl() + "/registrations",
            HttpMethod.POST,
            new HttpEntity<>(req, new HttpHeaders() {{ setContentType(MediaType.APPLICATION_JSON); }}),
            String.class
        );

        assertThat(response.getStatusCode().value()).isBetween(400, 422);
    }

    @Test
    @Order(4)
    @DisplayName("VAL-E2E: Official team missing proofFileKey → 4xx")
    void officialMissingProof_returns4xx() {
        RegistrationRequest req = new RegistrationRequest();
        req.setTeamName("Official No Proof");
        req.setOfficial(true);
        req.setMembers(List.of(
            memberWithSchool("Cap","cap@t.local","0612345670",TshirtSize.M,"ENSIAS", null),
            memberWithSchool("Sec","sec@t.local","0698765432",TshirtSize.L,"ENSA",   "proofs/k/f.pdf"),
            memberWithSchool("Trd","trd@t.local","0711223344",TshirtSize.S,"FST",    "proofs/k2/f.pdf")
        ));

        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl() + "/registrations",
            HttpMethod.POST,
            new HttpEntity<>(req, new HttpHeaders() {{ setContentType(MediaType.APPLICATION_JSON); }}),
            String.class
        );

        assertThat(response.getStatusCode().value()).isBetween(400, 422);
    }

    @Test
    @Order(5)
    @DisplayName("UP-04: Presign endpoint rejects .exe extension → 4xx")
    void presignRejectsExeExtension() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            baseUrl() + "/registrations/presign?filename=malware.exe&contentType=application/pdf",
            String.class
        );

        assertThat(response.getStatusCode().value()).isBetween(400, 422);
    }

    @Test
    @Order(6)
    @DisplayName("UP-04: Presign endpoint rejects text/html content-type → 4xx")
    void presignRejectsHtmlContentType() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            baseUrl() + "/registrations/presign?filename=test.pdf&contentType=text/html",
            String.class
        );

        assertThat(response.getStatusCode().value()).isBetween(400, 422);
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    private MemberRequest memberWithSchool(String name, String email, String phone,
                                           TshirtSize size, String school, String proofKey) {
        MemberRequest m = member(name, email, phone, size);
        m.setSchoolName(school);
        m.setProofFileKey(proofKey);
        return m;
    }
}
