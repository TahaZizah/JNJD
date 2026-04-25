/**
 * k6 Soak Test — JNJD Registration Platform
 *
 * Simulates sustained load over an extended period to detect:
 *   - JVM memory leaks (Heap growth without release)
 *   - HikariCP connection pool starvation
 *   - Redis connection drift under the Bucket4j rate limiter
 *   - MinIO presigned URL generation under steady throughput
 *
 * Run:
 *   k6 run tests/k6/soak-test.js --env BASE_URL=http://localhost:8080
 *
 * Monitor alongside this test:
 *   - JVM: jcmd <pid> VM.native_memory OR Spring Boot Actuator /actuator/metrics/jvm.memory.used
 *   - DB:  SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
 *   - Redis: redis-cli INFO clients
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate        = new Rate('soak_error_rate');
const presignLatency   = new Trend('soak_presign_latency_ms', true);
const registerLatency  = new Trend('soak_register_latency_ms', true);
const heapWarnings     = new Counter('heap_warning_count');

export const options = {
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus:      50,        // Moderate, sustained load
      duration: '8h',      // Soak overnight / during registration period
    },
  },
  thresholds: {
    'soak_error_rate':            ['rate<0.01'],  // < 1% errors over 8 hours
    'soak_presign_latency_ms':    ['p(95)<600'],
    'soak_register_latency_ms':   ['p(95)<2500'],
    'http_req_failed':            ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

function randomMoroccanPhone() {
  const prefix = Math.random() > 0.5 ? '06' : '07';
  return prefix + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

export default function () {
  const ts = `${__VU}_${__ITER}_${Date.now()}`;

  // ── Step 1: Request 3 presigned PUT URLs ────────────────────────────────────
  let presignOk = true;
  const objectKeys = [];

  group('presign', () => {
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      const filename = `proof_soak_${ts}_m${i}.pdf`;
      const res = http.get(
        `${BASE_URL}/api/v1/registrations/presign?filename=${encodeURIComponent(filename)}&contentType=application%2Fpdf`,
        { tags: { name: 'soak_presign' } }
      );
      presignLatency.add(Date.now() - start);

      const ok = check(res, {
        'presign 200':     r => r.status === 200,
        'has objectKey':   r => !!r.json('objectKey'),
      });

      if (!ok) { presignOk = false; errorRate.add(1); break; }
      objectKeys.push(res.json('objectKey'));
      errorRate.add(0);
    }
  });

  if (!presignOk) { sleep(2); return; }

  // ── Step 2: Submit registration ─────────────────────────────────────────────
  group('register', () => {
    const start   = Date.now();
    const payload = JSON.stringify({
      teamName:    `SoakTeam_${ts}`,
      isOfficial:  true,
      description: 'Soak test registration',
      members: [0, 1, 2].map(i => ({
        fullName:     `Member${i} Soak${ts}`,
        email:        `soak_${ts}_m${i}@test.local`,
        phone:        randomMoroccanPhone(),
        tshirtSize:   ['M', 'L', 'XL'][i],
        schoolName:   'Test School',
        proofFileKey: objectKeys[i],
      })),
    });

    const res = http.post(
      `${BASE_URL}/api/v1/registrations`,
      payload,
      { headers: { 'Content-Type': 'application/json' }, tags: { name: 'soak_register' } }
    );
    registerLatency.add(Date.now() - start);

    const ok = check(res, {
      'register 201':     r => r.status === 201,
      'has uuid id':      r => /^[0-9a-f-]{36}$/.test(r.json('id') || ''),
      'status PENDING':   r => r.json('status') === 'PENDING',
    });

    errorRate.add(ok ? 0 : 1);
    if (!ok) {
      console.warn(`[SOAK VU${__VU} ITER${__ITER}] Registration failed: ${res.status} — ${res.body?.substring(0, 150)}`);
    }
  });

  // ── Step 3: Poll Actuator for heap anomalies (every 100 iterations) ──────────
  if (__ITER % 100 === 0) {
    const metrics = http.get(`${BASE_URL}/actuator/metrics/jvm.memory.used`);
    if (metrics.status === 200) {
      const usedBytes = metrics.json('measurements.0.value');
      const usedMB    = Math.round(usedBytes / 1024 / 1024);
      // Warn if heap exceeds 512 MB — adjust for your JVM settings
      if (usedMB > 512) {
        heapWarnings.add(1);
        console.warn(`[HEAP ALERT] JVM heap at ${usedMB}MB at iteration ${__ITER}`);
      }
    }
  }

  // Real users don't hammer—they read confirmation, then leave
  sleep(Math.random() * 3 + 2);
}

export function setup() {
  const res = http.get(`${BASE_URL}/actuator/health`);
  if (res.status !== 200) throw new Error(`Health check failed: ${res.status}`);
  console.log('✅ Soak test starting — monitoring memory, pool, and latency trends...');
}
