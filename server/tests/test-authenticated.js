import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("=== ECO-LAB AUTHENTICATED API SECURITY TEST ===");
  let failures = 0;

  const testUserA = {
    email: `test_user_a_${Date.now()}@example.com`,
    password: "Password123!",
    displayName: "User A",
  };

  const testUserB = {
    email: `test_user_b_${Date.now()}@example.com`,
    password: "Password456!",
    displayName: "User B",
  };

  let tokenA = null;
  let uidA = null;
  let tokenB = null;
  let uidB = null;

  // 1. Register User A
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, testUserA);
    if (res.data.token && res.data.user && res.data.user.uid) {
      tokenA = res.data.token;
      uidA = res.data.user.uid;
      console.log(`[PASS] Register User A (uid: ${uidA})`);
    } else {
      console.log("[FAIL] Register User A - missing token or user data");
      failures++;
    }
  } catch (err) {
    console.log("[FAIL] Register User A failed:", err.response?.data || err.message);
    failures++;
  }

  // 2. Register User B
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, testUserB);
    if (res.data.token && res.data.user && res.data.user.uid) {
      tokenB = res.data.token;
      uidB = res.data.user.uid;
      console.log(`[PASS] Register User B (uid: ${uidB})`);
    } else {
      console.log("[FAIL] Register User B - missing token or user data");
      failures++;
    }
  } catch (err) {
    console.log("[FAIL] Register User B failed:", err.response?.data || err.message);
    failures++;
  }

  if (!tokenA || !tokenB) {
    console.log("Aborting subsequent tests due to registration failure.");
    process.exit(1);
  }

  // 3. Login User A
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUserA.email,
      password: testUserA.password,
    });
    if (res.data.token && res.data.user.uid === uidA) {
      console.log("[PASS] Login User A");
    } else {
      console.log("[FAIL] Login User A returned mismatched info");
      failures++;
    }
  } catch (err) {
    console.log("[FAIL] Login User A failed:", err.response?.data || err.message);
    failures++;
  }

  // 4. Access User A's history with User A's token
  try {
    const res = await axios.get(`${BASE_URL}/footprint/${uidA}/history`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (Array.isArray(res.data)) {
      console.log("[PASS] Authorized GET /api/footprint/:uid/history");
    } else {
      console.log("[FAIL] Authorized GET /api/footprint/:uid/history returned invalid shape");
      failures++;
    }
  } catch (err) {
    console.log("[FAIL] Authorized GET /api/footprint/:uid/history failed:", err.response?.data || err.message);
    failures++;
  }

  // 5. Access User A's history with User B's token (should be 403 Forbidden)
  try {
    await axios.get(`${BASE_URL}/footprint/${uidA}/history`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log("[FAIL] Cross-user access check (Expected 403 Forbidden, but request succeeded)");
    failures++;
  } catch (err) {
    if (err.response && err.response.status === 403) {
      console.log("[PASS] Cross-user access check (Correctly returned 403 Forbidden)");
    } else {
      console.log("[FAIL] Cross-user access check returned unexpected error:", err.message);
      failures++;
    }
  }

  // 6. Access User A's history with an invalid token (should be 401 Unauthorized)
  try {
    await axios.get(`${BASE_URL}/footprint/${uidA}/history`, {
      headers: { Authorization: `Bearer invalid_token` },
    });
    console.log("[FAIL] Invalid token check (Expected 401 Unauthorized, but request succeeded)");
    failures++;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log("[PASS] Invalid token check (Correctly returned 401 Unauthorized)");
    } else {
      console.log("[FAIL] Invalid token check returned unexpected error:", err.message);
      failures++;
    }
  }

  // 7. Verify login rate limiting (max 10 requests per 15 mins)
  console.log("Sending multiple requests to login route to trigger rate limiter...");
  let rateLimitTriggered = false;
  for (let i = 0; i < 15; i++) {
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testUserA.email,
        password: testUserA.password,
      });
    } catch (err) {
      if (err.response && err.response.status === 429) {
        rateLimitTriggered = true;
        console.log(`[PASS] Rate limiter triggered at attempt ${i + 1} with 429`);
        break;
      }
    }
  }
  if (!rateLimitTriggered) {
    console.log("[FAIL] Rate limiter was not triggered after 15 requests");
    failures++;
  }

  console.log("=== SECURITY TEST RESULT SUMMARY ===");
  if (failures === 0) {
    console.log("ALL SECURITY TESTS PASSED.");
    process.exit(0);
  } else {
    console.log(`${failures} TEST CASE(S) FAILED.`);
    process.exit(1);
  }
}

runTests();
