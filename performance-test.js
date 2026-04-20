import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 min
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  // Simulating a user loading the registration form (frontend load might hit API for config/validation later)
  // Here we just test an example public backend endpoint or health check if one exists.
  // For JNJD, let's test a hypothetical public health or ping endpoint. If none exists, 
  // you might hit the frontend asset server (if served dynamically) or the API root.
  
  // Since Actuator is in pom.xml, we can hit the health endpoint
  let res = http.get(`${BASE_URL}/actuator/health`);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'health is UP': (r) => r.json().status === 'UP',
  });

  sleep(1);
}
