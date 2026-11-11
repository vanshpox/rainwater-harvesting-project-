import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRWH, computeSustainabilityScore, INDIAN_CITIES, FILTRATION_EFFICIENCY, WATER_TARIFF_PER_LITRE_INR } from './calculations.ts';

test('calculateRWH calculates correct annual harvest using standard hydrological formula', () => {
  // 1000 m2 roof, 1 building, 1000 mm rainfall, 0.8 runoff coeff
  // Annual Yield = 1000 * 1000 * 0.8 * 0.90 = 720,000 Litres
  const input = {
    roofAreaSqM: 1000,
    annualRainfallMm: 1000,
    runoffCoefficient: 0.8,
    numberOfBuildings: 1,
    storageTankCapacityL: 100000,
    dailyCampusDemandL: 10000,
  };
  const results = calculateRWH(input);
  assert.equal(results.totalCatchmentAreaSqM, 1000);
  assert.equal(results.annualHarvestL, 720000);
  assert.equal(results.annualHarvestKL, 720.0);
  assert.equal(results.dailyAverageL, Math.round(720000 / 365));
});

test('calculateRWH scales linearly with multiple campus buildings', () => {
  const single = calculateRWH({
    roofAreaSqM: 1200,
    annualRainfallMm: 970,
    runoffCoefficient: 0.85,
    numberOfBuildings: 1,
    storageTankCapacityL: 50000,
  });

  const multiple = calculateRWH({
    roofAreaSqM: 1200,
    annualRainfallMm: 970,
    runoffCoefficient: 0.85,
    numberOfBuildings: 4,
    storageTankCapacityL: 200000,
  });

  assert.equal(multiple.totalCatchmentAreaSqM, 1200 * 4);
  assert.equal(multiple.annualHarvestL, single.annualHarvestL * 4);
});

test('financial savings calculate correctly at designated INR tariff', () => {
  const input = {
    roofAreaSqM: 2000,
    annualRainfallMm: 1000,
    runoffCoefficient: 0.85,
    numberOfBuildings: 2,
    storageTankCapacityL: 150000,
  };
  const results = calculateRWH(input);
  const expectedAnnualYield = 4000 * 1000 * 0.85 * FILTRATION_EFFICIENCY; // 3,060,000 L
  assert.equal(results.annualHarvestL, expectedAnnualYield);
  assert.equal(results.estimatedAnnualSavingsINR, Math.round(expectedAnnualYield * WATER_TARIFF_PER_LITRE_INR));
  assert.ok(results.fiveYearSavingsINR > results.estimatedAnnualSavingsINR * 5); // due to 5% tariff inflation
});

test('environmental equivalents produce positive non-zero realistic metrics', () => {
  const input = {
    roofAreaSqM: 3000,
    annualRainfallMm: 1400,
    runoffCoefficient: 0.85,
    numberOfBuildings: 3,
    storageTankCapacityL: 250000,
  };
  const results = calculateRWH(input);
  assert.ok(results.tankersEliminated > 0);
  assert.ok(results.treesEquivalent > 0);
  assert.ok(results.carbonFootprintSavedKg > 0);
  assert.ok(results.groundwaterRechargeL > 0);
});

test('sustainability score stays bounded between 0 and 100 with valid grade assignment', () => {
  const highCampus = calculateRWH({
    roofAreaSqM: 5000,
    annualRainfallMm: 2420,
    runoffCoefficient: 0.9,
    numberOfBuildings: 5,
    storageTankCapacityL: 500000,
    dailyCampusDemandL: 20000,
  });
  assert.ok(highCampus.sustainabilityScore.total >= 80 && highCampus.sustainabilityScore.total <= 100);
  assert.ok(['A+', 'A'].includes(highCampus.sustainabilityScore.grade));

  const minimalCampus = calculateRWH({
    roofAreaSqM: 100,
    annualRainfallMm: 200,
    runoffCoefficient: 0.4,
    numberOfBuildings: 1,
    storageTankCapacityL: 2000,
    dailyCampusDemandL: 50000,
  });
  assert.ok(minimalCampus.sustainabilityScore.total <= 45);
  assert.ok(['C', 'D'].includes(minimalCampus.sustainabilityScore.grade));
});

test('Indian city presets contain valid meteorological data and 12-month profiles', () => {
  assert.ok(INDIAN_CITIES.length >= 10);
  for (const city of INDIAN_CITIES) {
    assert.ok(city.annualRainfallMm > 0);
    assert.equal(city.monsoonProfile.length, 12);
  }
});
