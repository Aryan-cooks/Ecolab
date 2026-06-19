import { describe, it, expect } from "vitest";
import { calculateFootprint } from "./calculationEngine";
import factors from "../data/emissionFactors.json";

describe("Calculation Engine", () => {
  it("calculates transport footprint correctly", () => {
    const inputs = {
      transport: {
        vehicleType: "petrolCar",
        weeklyKm: 100,
        transitPercent: 0,
        flightsPerYear: 0
      }
    };
    
    const result = calculateFootprint(inputs);
    const expectedEmissions = 100 * 52 * factors.transport.petrolCar;
    expect(result.breakdown.transport).toBe(Math.round(expectedEmissions));
  });

  it("calculates food footprint correctly", () => {
    const inputs = {
      food: {
        dietType: "vegan",
        wasteLevel: "low",
        localFoodPercent: 50
      }
    };
    
    const result = calculateFootprint(inputs);
    const expectedEmissions = factors.food.vegan * 365 * 0.9 * 0.95;
    expect(result.breakdown.food).toBe(Math.round(expectedEmissions));
  });

  it("calculates home energy footprint correctly", () => {
    const inputs = {
      home: {
        monthlyKwh: 200,
        lpgCylindersPerMonth: 1
      }
    };
    
    const result = calculateFootprint(inputs);
    const expectedEmissions = (200 * 12 * factors.energy.electricityIndia) + (1 * 12 * factors.energy.lpgPerCylinder);
    expect(result.breakdown.home).toBe(Math.round(expectedEmissions));
  });

  it("calculates lifestyle footprint correctly", () => {
    const inputs = {
      lifestyle: {
        monthlyClothingSpend: 5000,
        screenHoursPerDay: 4,
        recyclingHabits: "full"
      }
    };
    
    const result = calculateFootprint(inputs);
    const expectedEmissions = ((5000 * 12 * (factors.lifestyle.clothingPerINR1000 / 1000)) + (4 * 365 * factors.lifestyle.screenHourPerDay)) * 0.9;
    expect(result.breakdown.lifestyle).toBe(Math.round(expectedEmissions));
  });

  it("handles missing/zero inputs with sane defaults (does not throw)", () => {
    const inputs = {};
    const result = calculateFootprint(inputs);
    
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.breakdown.transport).toBe(0);
    
    const expectedFood = factors.food.vegetarian * 365 * 1.0 * 1.0;
    expect(result.breakdown.food).toBe(Math.round(expectedFood));
    expect(result.breakdown.home).toBe(0);
    expect(result.breakdown.lifestyle).toBe(0);
  });

  it("bounds greenScore correctly and assigns levels", () => {
    const highEmissions = {
      transport: { vehicleType: "petrolCar", weeklyKm: 10000, transitPercent: 0, flightsPerYear: 50 },
      home: { monthlyKwh: 5000, lpgCylindersPerMonth: 5 }
    };
    const seedlingResult = calculateFootprint(highEmissions);
    expect(seedlingResult.greenScore).toBe(0); 
    expect(seedlingResult.level).toBe("seedling");

    const lowEmissions = {
      transport: { vehicleType: "metro", weeklyKm: 0, transitPercent: 100, flightsPerYear: 0 },
      food: { dietType: "vegan", wasteLevel: "low", localFoodPercent: 100 },
      home: { monthlyKwh: 0, lpgCylindersPerMonth: 0 },
      lifestyle: { monthlyClothingSpend: 0, screenHoursPerDay: 0, recyclingHabits: "full" }
    };
    const guardianResult = calculateFootprint(lowEmissions);
    expect(guardianResult.greenScore).toBe(1000); 
    expect(guardianResult.level).toBe("guardian");
  });

  it("clamps percentileRank between 0 and 100", () => {
    const highEmissions = calculateFootprint({
      transport: { weeklyKm: 100000, flightsPerYear: 100 }
    });
    expect(highEmissions.percentileRank).toBe(0);

    const lowEmissions = calculateFootprint({
      transport: { weeklyKm: 0, flightsPerYear: 0 },
      food: { dietType: "vegan" },
      home: { monthlyKwh: 0, lpgCylindersPerMonth: 0 },
      lifestyle: { monthlyClothingSpend: 0, screenHoursPerDay: 0 }
    });
    expect(lowEmissions.percentileRank).toBeGreaterThanOrEqual(0);
    expect(lowEmissions.percentileRank).toBeLessThanOrEqual(100);
  });
});
