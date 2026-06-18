import factors from "../data/emissionFactors.json";

export function calculateFootprint(inputs) {
  // 1. Transport
  const transportInput = inputs.transport || {};
  const vehicleType = transportInput.vehicleType || "petrolCar";
  const weeklyKm = parseFloat(transportInput.weeklyKm) || 0;
  const transitPercent = parseFloat(transportInput.transitPercent) || 0;
  const flightsPerYear = parseFloat(transportInput.flightsPerYear) || 0;

  const carFactor = factors.transport[vehicleType] || factors.transport.petrolCar;
  const busFactor = factors.transport.bus;
  const metroFactor = factors.transport.metro;
  const flightFactor = factors.transport.flight_domestic;

  const carDistance = weeklyKm * (1 - transitPercent / 100);
  const transitDistance = weeklyKm * (transitPercent / 100);

  const carEmissions = carDistance * 52 * carFactor;
  // If transit, assume 70% bus and 30% metro, or if vehicleType itself is metro/bus, use that.
  const transitFactorUsed =
    vehicleType === "metro" ? metroFactor : vehicleType === "bus" ? busFactor : busFactor;
  const transitEmissions = transitDistance * 52 * transitFactorUsed;
  const flightEmissions = flightsPerYear * 2000 * flightFactor; // Assume 2000km return flight on average

  const transportTotal = carEmissions + transitEmissions + flightEmissions;

  // 2. Food
  const foodInput = inputs.food || {};
  const dietType = foodInput.dietType || "vegetarian";
  const wasteLevel = foodInput.wasteLevel || "medium";
  const localFoodPercent = parseFloat(foodInput.localFoodPercent) || 0;

  const dietFactor = factors.food[dietType] || factors.food.vegetarian;
  const wasteMultiplier = wasteLevel === "low" ? 0.9 : wasteLevel === "high" ? 1.2 : 1.0;
  const localFoodMultiplier = 1 - 0.1 * (localFoodPercent / 100);

  const foodTotal = dietFactor * 365 * wasteMultiplier * localFoodMultiplier;

  // 3. Home Energy
  const homeInput = inputs.home || {};
  const monthlyKwh = parseFloat(homeInput.monthlyKwh) || 0;
  const lpgCylindersPerMonth = parseFloat(homeInput.lpgCylindersPerMonth) || 0;

  const electricityEmissions = monthlyKwh * 12 * factors.energy.electricityIndia;
  const lpgEmissions = lpgCylindersPerMonth * 12 * factors.energy.lpgPerCylinder;

  const homeTotal = electricityEmissions + lpgEmissions;

  // 4. Lifestyle
  const lifestyleInput = inputs.lifestyle || {};
  const monthlyClothingSpend = parseFloat(lifestyleInput.monthlyClothingSpend) || 0;
  const screenHoursPerDay = parseFloat(lifestyleInput.screenHoursPerDay) || 0;
  const recyclingHabits = lifestyleInput.recyclingHabits || "partial";

  const clothingFactor = factors.lifestyle.clothingPerINR1000 / 1000;
  const screenFactor = factors.lifestyle.screenHourPerDay;
  const recyclingMultiplier =
    recyclingHabits === "none" ? 1.1 : recyclingHabits === "full" ? 0.9 : 1.0;

  const clothingEmissions = monthlyClothingSpend * 12 * clothingFactor;
  const screenEmissions = screenHoursPerDay * 365 * screenFactor;

  const lifestyleTotal = (clothingEmissions + screenEmissions) * recyclingMultiplier;

  // Total in kg
  const totalKg = transportTotal + foodTotal + homeTotal + lifestyleTotal;
  const totalTons = totalKg / 1000;

  // Green Score
  // formula: score = max(0, 1000 - (total - 500) / 7.5)
  // Let's keep it bounded between 0 and 1000
  const totalKgScoreRef = totalKg;
  let greenScore = Math.max(0, Math.min(1000, 1000 - (totalKgScoreRef - 500) / 7.5));
  greenScore = Math.round(greenScore);

  // Level System
  // Seedling < 250 | Sapling 250–499 | Tree 500–749 | Guardian 750+
  let level = "seedling";
  if (greenScore >= 750) level = "guardian";
  else if (greenScore >= 500) level = "tree";
  else if (greenScore >= 250) level = "sapling";

  return {
    breakdown: {
      transport: Math.round(transportTotal),
      food: Math.round(foodTotal),
      home: Math.round(homeTotal),
      lifestyle: Math.round(lifestyleTotal),
    },
    total: Math.round(totalKg),
    totalTons: parseFloat(totalTons.toFixed(2)),
    greenScore,
    level,
    nationalAverageIndia: 2000,
    percentileRank: Math.max(0, Math.min(100, Math.round(100 - (totalKg / 4000) * 100))), // mock percentile compared to an average Indian (closer to 2000kg)
  };
}
