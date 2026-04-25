/**
 * k6 Stress Test — JNJD Registration Platform
 *
 * Goal: Find the breaking point of the system by gradually increasing
 * load until error rate exceeds threshold. This identifies the bottleneck
 * (DB CPU, Spring Boot memory, or MinIO bandwidth).
 *
 * Interpret results:
 *   - If failures start at low VU count → likely DB connection pool exhaustion (HikariCP)
 *   - If failures start at high VU count → JVM heap pressure or MinIO bandwidth
 *   - Watch: http_req_failed, http_req_duration p(99), system CPU/memory
 *
 * Run:
 *   k6 run tests/k6/stress-test.js --env BASE_URL=http://localhost:8080 \
 *      --out json=results/stress-$(date +%Y%m%d_%H%M%S).json
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate       = new Rate('stress_error_rate');
const registerLatency = new Trend('stress_register_latency_ms', true);

export const options = {
  // Gradually ramp up until the system fails
  stages: [
    { duration: '2m',  target: 100  },  // Warm up
    { duration: '5m',  target: 500  },  // Normal load
    { duration: '5m',  target: 1000 },  // Heavy load
    { duration: '5m',  target: 2000 },  // Stress — likely to find breaking point
    { duration: '2m',  target: 3000 },  // Beyond capacity
    { duration: '3m',  target: 0    },  // Recovery — system should recover
  ],
  thresholds: {
    // Intentionally lenient — we WANT to find the breaking point
    'stress_error_rate':         ['rate<0.50'],  // Alert when 50% fail
    'stress_register_latency_ms': ['p(99)<10000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

function moroccanPhone() {
  return (Math.random() > 0.5 ? '06' : '07') +
    Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

export default function () {
  const ts = `${__VU}_${Date.now()}`;

  // Step 1: Presign (lightweight — tests Redis + MinIO URL generation)
  const presignRes = http.get(
    `${BASE_URL}/api/v1/registrations/presign?filename=stress_${ts}.pdf&contentType=application%2Fpdf`,
    { tags: { name: 'stress_presign' } }
  );

  const presignOk = check(presignRes, {
    'presign 200': r => r.status === 200,
  });

  errorRate.add(presignOk ? 0 : 1);
  if (!presignOk) { sleep(0.5); return; }

  const objectKey = presignRes.json('objectKey') || `proofs/stress/${ts}/f.pdf`;

  // Step 2: Full registration (heavyweight — tests DB write + validation)
  const start = Date.now();
  const regRes = http.post(
    `${BASE_URL}/api/v1/registrations`,
    JSON.stringify({
      teamName:   `StressTeam_${ts}`,
      isOfficial: false,
      members: [0, 1, 2].map(i => ({
        fullName:   `Stress Member ${i}`,
        email:      `stress_${ts}_m${i}@test.local`,
        phone:      moroccanPhone(),
        tshirtSize: 'M',
      })),
    }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'stress_register' } }
  );
  registerLatency.add(Date.now() - start);

  const regOk = check(regRes, {
    'register 201': r => r.status === 201,
    'no 5xx':       r => r.status < 500,
  });

  errorRate.add(regOk ? 0 : 1);

  if (!regOk) {
    console.warn(`[STRESS VU${__VU}] Failed: HTTP ${regRes.status}`);
  }

  sleep(0.5);
}

export function setup() {
  const res = http.get(`${BASE_URL}/actuator/health`);
  if (res.status !== 200) {
    throw new Error(`Health check failed: ${res.status} — cannot start stress test`);
  }
  console.log('✅ Starting stress test — gradually increasing to 3000 VUs to find breaking point...');
}

export function handleSummary(data) {
  const errorPct = (data.metrics['stress_error_rate']?.values?.rate * 100 || 0).toFixed(2);
  const p95ms    = Math.round(data.metrics['stress_register_latency_ms']?.values?.['p(95)'] || 0);
  const p99ms    = Math.round(data.metrics['stress_register_latency_ms']?.values?.['p(99)'] || 0);

  console.log('\n═══════════════════════════════════════════');
  console.log('STRESS TEST SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`Error rate:           ${errorPct}%`);
  console.log(`Register latency p95: ${p95ms}ms`);
  console.log(`Register latency p99: ${p99ms}ms`);
  console.log('═══════════════════════════════════════════');

  return {}; // Use k6's default summary output
}
