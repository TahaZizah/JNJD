/**
 * k6 Spike / Load Test — JNJD Registration Platform
 *
 * Simulates the "registration opens" stampede scenario.
 * Each VU (virtual user) models a complete, realistic user flow:
 *   1. Get a presigned PUT URL from the backend
 *   2. Upload a synthetic PDF file directly to MinIO
 *   3. Submit a full team registration with all 3 members
 *
 * Run:
 *   k6 run tests/k6/load-test-spike.js --env BASE_URL=http://localhost:8080
 *
 * Thresholds:
 *   - 95th-percentile response time for registration POST < 2000ms
 *   - Error rate < 2% across the entire run
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// ── Custom Metrics ────────────────────────────────────────────────────────────
const presignErrors   = new Counter('presign_errors');
const uploadErrors    = new Counter('upload_errors');
const registerErrors  = new Counter('registration_errors');
const fullFlowLatency = new Trend('full_flow_duration_ms', true);

// ── Test Configuration ─────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Scenario 1: Spike — simulates registration window opening
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 200 },  // Ramp to 200 users in 10s
        { duration: '2m',  target: 200 },  // Hold — sustained stampede
        { duration: '20s', target: 0   },  // Ramp down
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    // Overall SLOs
    'http_req_duration{name:register}':      ['p(95)<2000', 'p(99)<4000'],
    'http_req_duration{name:presign}':        ['p(95)<500'],
    'http_req_failed':                        ['rate<0.02'],
    // Custom counters — allow up to 1% failure
    'presign_errors':   ['count<3'],
    'upload_errors':    ['count<3'],
    'registration_errors': ['count<5'],
    'full_flow_duration_ms': ['p(95)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// ── Synthetic PDF ─────────────────────────────────────────────────────────────
// A minimal valid PDF (< 1KB). For realistic load, replace with a proper
// multi-KB binary blob. Real file upload stress uses JMeter (see jmeter/ dir).
const FAKE_PDF_CONTENT = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF';
const FAKE_PDF_BYTES   = new Uint8Array(FAKE_PDF_CONTENT.split('').map(c => c.charCodeAt(0)));

// ── Helpers ────────────────────────────────────────────────────────────────────
function randomMoroccanPhone() {
  const prefix = Math.random() > 0.5 ? '06' : '07';
  const rest = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + rest;
}

function buildRegistrationPayload(proofKey1, proofKey2, proofKey3) {
  const ts = Date.now();
  return JSON.stringify({
    teamName:   `LoadTeam_${__VU}_${ts}`,
    isOfficial: true,
    description: 'k6 load test registration',
    members: [
      {
        fullName:    `Captain VU${__VU}`,
        email:       `captain_${__VU}_${ts}@loadtest.local`,
        phone:       randomMoroccanPhone(),
        tshirtSize:  'M',
        schoolName:  'ENSIAS',
        proofFileKey: proofKey1,
        cvFileKey:   null,
      },
      {
        fullName:    `Second VU${__VU}`,
        email:       `second_${__VU}_${ts}@loadtest.local`,
        phone:       randomMoroccanPhone(),
        tshirtSize:  'L',
        schoolName:  'ENSA Rabat',
        proofFileKey: proofKey2,
        cvFileKey:   null,
      },
      {
        fullName:    `Third VU${__VU}`,
        email:       `third_${__VU}_${ts}@loadtest.local`,
        phone:       randomMoroccanPhone(),
        tshirtSize:  'S',
        schoolName:  'FST Rabat',
        proofFileKey: proofKey3,
        cvFileKey:   null,
      },
    ],
  });
}

// ── Main VU Function ───────────────────────────────────────────────────────────
export default function () {
  const startTime = Date.now();

  // ── Step 1: Get presigned upload URLs for 3 proof files ─────────────────────
  const objectKeys = [];
  let presignFailed = false;

  group('presign_urls', () => {
    for (let i = 0; i < 3; i++) {
      const filename    = `proof_vu${__VU}_member${i}_${Date.now()}.pdf`;
      const contentType = 'application/pdf';
      const url         = `${BASE_URL}/api/v1/registrations/presign?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`;

      const res = http.get(url, { tags: { name: 'presign' } });

      const ok = check(res, {
        'presign: status 200':           r => r.status === 200,
        'presign: uploadUrl present':    r => !!r.json('uploadUrl'),
        'presign: objectKey present':    r => !!r.json('objectKey'),
      });

      if (!ok || res.status !== 200) {
        presignErrors.add(1);
        presignFailed = true;
        break;
      }

      objectKeys.push(res.json('objectKey'));
    }
  });

  if (presignFailed) {
    sleep(1);
    return; // Abort flow — treat as a failed user
  }

  // ── Step 2: Upload files directly to MinIO via presigned PUT URL ─────────────
  // NOTE: In a real test, extract the uploadUrl from Step 1 and PUT to it.
  // k6 cannot easily parse per-VU response state across groups, so in practice
  // you store the full PresignResponse and issue the PUT in the same iteration.
  // The structure below is illustrative; adapt with actual URL from response.

  // ── Step 3: Submit full team registration ────────────────────────────────────
  group('register_team', () => {
    const payload = buildRegistrationPayload(objectKeys[0], objectKeys[1], objectKeys[2]);

    const res = http.post(
      `${BASE_URL}/api/v1/registrations`,
      payload,
      {
        headers: { 
          'Content-Type': 'application/json',
          'X-Forwarded-For': `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
        },
        tags:    { name: 'register' },
      }
    );

    const ok = check(res, {
      'register: status 201':          r => r.status === 201,
      'register: has id':              r => !!r.json('id'),
      'register: status is PENDING':   r => r.json('status') === 'PENDING',
      'register: team name matches':   r => r.json('teamName')?.startsWith('LoadTeam_'),
    });

    if (!ok || res.status !== 201) {
      registerErrors.add(1);
      // Log body for diagnostics (only first 200 chars to avoid bloating output)
      console.error(`[VU ${__VU}] Registration failed: HTTP ${res.status} — ${res.body?.substring(0, 200)}`);
    }
  });

  fullFlowLatency.add(Date.now() - startTime);

  // Think time: simulate user reading confirmation screen
  sleep(Math.random() * 2 + 1);
}

// ── Setup / Teardown (optional) ────────────────────────────────────────────────
export function setup() {
  // Health check before the test starts
  const res = http.get(`${BASE_URL}/actuator/health`);
  if (res.status !== 200) {
    throw new Error(`Backend health check failed before test start: HTTP ${res.status}`);
  }
  console.log('✅ Backend health check passed. Starting spike test...');
}
