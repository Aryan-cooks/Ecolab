import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== ECO-LAB API INTEGRITY TEST ===');
  let failures = 0;

  // 1. Health check
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status === 'OK') {
      console.log('[PASS] GET /api/health');
    } else {
      console.log('[FAIL] GET /api/health - status not OK');
      failures++;
    }
  } catch (err) {
    console.log('[FAIL] GET /api/health - connection error', err.message);
    failures++;
  }

  // 2. Calculate footprint
  const testInputs = {
    transport: { vehicleType: 'petrolCar', weeklyKm: 150, transitPercent: 10, flightsPerYear: 2 },
    food: { dietType: 'vegetarian', wasteLevel: 'medium', localFoodPercent: 40 },
    home: { monthlyKwh: 200, lpgCylindersPerMonth: 1, homeSizeSqm: 80 },
    lifestyle: { monthlyClothingSpend: 3000, screenHoursPerDay: 5, recyclingHabits: 'partial' }
  };

  let calculationResults = null;
  try {
    const res = await axios.post(`${BASE_URL}/footprint/calculate`, { inputs: testInputs });
    calculationResults = res.data.results;
    if (calculationResults && calculationResults.total !== undefined && calculationResults.greenScore !== undefined && calculationResults.breakdown) {
      console.log('[PASS] POST /api/footprint/calculate');
      console.log(`       Calculated footprint: ${calculationResults.totalTons} T, Green Score: ${calculationResults.greenScore}`);
    } else {
      console.log('[FAIL] POST /api/footprint/calculate - missing response parameters');
      failures++;
    }
  } catch (err) {
    console.log('[FAIL] POST /api/footprint/calculate - request failed', err.message);
    failures++;
  }

  // 3. Save footprint
  try {
    const res = await axios.post(`${BASE_URL}/footprint/save`, {
      uid: 'test_user_operator_9',
      inputs: testInputs,
      results: calculationResults
    });
    if (res.data.saved && res.data.logId) {
      console.log('[PASS] POST /api/footprint/save');
    } else {
      console.log('[FAIL] POST /api/footprint/save - invalid response structure');
      failures++;
    }
  } catch (err) {
    console.log('[FAIL] POST /api/footprint/save - request failed', err.message);
    failures++;
  }

  // 4. Fetch history
  try {
    const res = await axios.get(`${BASE_URL}/footprint/test_user_operator_9/history`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      console.log('[PASS] GET /api/footprint/:uid/history');
    } else {
      console.log('[FAIL] GET /api/footprint/:uid/history - empty history logs');
      failures++;
    }
  } catch (err) {
    console.log('[FAIL] GET /api/footprint/:uid/history - request failed', err.message);
    failures++;
  }

  // 5. suggestions
  try {
    const res = await axios.post(`${BASE_URL}/ai/suggestions`, {
      uid: 'test_user_operator_9',
      footprintData: calculationResults,
      userProfile: { displayName: 'Tester Node', location: { city: 'Durgapur', state: 'West Bengal' } }
    });
    if (Array.isArray(res.data.suggestions) && res.data.suggestions.length === 8) {
      console.log('[PASS] POST /api/ai/suggestions - returned 8 suggestions');
    } else {
      console.log('[FAIL] POST /api/ai/suggestions - structure invalid');
      failures++;
    }
  } catch (err) {
    console.log('[FAIL] POST /api/ai/suggestions - request failed', err.message);
    failures++;
  }

  // 6. chat
  try {
    const res = await axios.post(`${BASE_URL}/ai/chat`, {
      uid: 'test_user_operator_9',
      messages: [{ sender: 'user', text: 'How do I optimize transport?' }],
      userContext: { name: 'Tester', location: 'Durgapur', totalKgCO2e: 3200 }
    });
    if (res.data.reply) {
      console.log('[PASS] POST /api/ai/chat');
    } else {
      console.log('[FAIL] POST /api/ai/chat - missing reply');
      failures++;
    }
  } catch (err) {
    console.log('[FAIL] POST /api/ai/chat - request failed', err.message);
    failures++;
  }

  // 7. Leaderboard
  try {
    const res = await axios.get(`${BASE_URL}/leaderboard`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      console.log('[PASS] GET /api/leaderboard');
    } else {
      console.log('[FAIL] GET /api/leaderboard - empty leaderboard data');
      failures++;
    }
  } catch (err) {
    console.log('[FAIL] GET /api/leaderboard - request failed', err.message);
    failures++;
  }

  console.log('=== TEST RESULT SUMMARY ===');
  if (failures === 0) {
    console.log('ALL TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.log(`${failures} TEST CASE(S) FAILED.`);
    process.exit(1);
  }
}

runTests();
