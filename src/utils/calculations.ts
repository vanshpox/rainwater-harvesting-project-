/**
 * Smart Rainwater Harvesting System for College Campuses
 * Pure hydrological calculations, environmental metrics, and sustainability scoring.
 * References: Central Ground Water Board (CGWB) & Bureau of Indian Standards IS 15797:2008
 */

export interface RWHInput {
  roofAreaSqM: number;
  annualRainfallMm: number;
  runoffCoefficient: number;
  numberOfBuildings: number;
  storageTankCapacityL: number;
  dailyCampusDemandL?: number;
}

export interface CityPreset {
  id: string;
  name: string;
  state: string;
  annualRainfallMm: number;
  monsoonProfile: number[]; // 12 monthly percentage weights (sum to 100)
  climateZone: string;
}

export interface RWHResults {
  totalCatchmentAreaSqM: number;
  annualHarvestL: number;
  annualHarvestKL: number;
  monthlyHarvestL: number[];
  dailyAverageL: number;
  estimatedAnnualSavingsINR: number;
  fiveYearSavingsINR: number;
  groundwaterRechargeL: number;
  tankersEliminated: number;
  treesEquivalent: number;
  carbonFootprintSavedKg: number;
  dryDaysSustained: number;
  tankTurnoverRatio: number;
  sustainabilityScore: {
    total: number;
    grade: string;
    level: string;
    breakdown: {
      catchmentScore: number;
      efficiencyScore: number;
      storageAdequacyScore: number;
      utilizationScore: number;
    };
  };
}

// Typical filtration & first-flush efficiency factor (CGWB recommends 90% net yield)
export const FILTRATION_EFFICIENCY = 0.90;

// Commercial water tanker / institutional municipal tariff in India (₹45 per 1,000 Litres)
export const WATER_TARIFF_PER_LITRE_INR = 0.045;

// Indian Cities Meteorological Data (IMD averages)
export const INDIAN_CITIES: CityPreset[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    annualRainfallMm: 970,
    monsoonProfile: [0.5, 0.8, 1.8, 4.5, 11.2, 8.5, 11.8, 14.7, 21.0, 16.5, 6.7, 2.0],
    climateZone: 'Tropical Savanna',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    annualRainfallMm: 2420,
    monsoonProfile: [0.1, 0.1, 0.1, 0.2, 1.2, 23.5, 38.0, 24.5, 11.2, 0.9, 0.1, 0.1],
    climateZone: 'Coastal Tropical Monsoon',
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    annualRainfallMm: 1400,
    monsoonProfile: [1.8, 0.8, 0.5, 1.2, 3.2, 4.5, 7.8, 9.5, 10.2, 23.5, 26.5, 10.5],
    climateZone: 'Coastal Northeast Monsoon',
  },
  {
    id: 'delhi',
    name: 'New Delhi',
    state: 'National Capital Region',
    annualRainfallMm: 790,
    monsoonProfile: [1.8, 1.9, 1.6, 1.2, 2.8, 8.5, 30.5, 33.2, 14.5, 2.0, 0.8, 1.2],
    climateZone: 'Semi-Arid Continental',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    annualRainfallMm: 1650,
    monsoonProfile: [0.8, 1.8, 2.5, 4.2, 9.8, 18.5, 24.0, 21.5, 13.5, 3.0, 0.2, 0.2],
    climateZone: 'Tropical Wet & Dry',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    annualRainfallMm: 812,
    monsoonProfile: [0.8, 0.9, 1.2, 2.5, 4.0, 13.5, 22.0, 23.5, 21.0, 8.5, 1.8, 0.3],
    climateZone: 'Semi-Arid Tropical',
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    annualRainfallMm: 750,
    monsoonProfile: [0.1, 0.1, 0.3, 1.8, 3.2, 19.5, 34.0, 23.0, 14.5, 2.8, 0.5, 0.2],
    climateZone: 'Hot Semi-Arid',
  },
  {
    id: 'cherrapunji',
    name: 'Cherrapunji',
    state: 'Meghalaya',
    annualRainfallMm: 11430,
    monsoonProfile: [0.3, 0.9, 3.2, 8.5, 14.2, 24.5, 25.0, 14.5, 7.2, 1.4, 0.2, 0.1],
    climateZone: 'Subtropical Highland Rainbelt',
  },
  {
    id: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    annualRainfallMm: 3100,
    monsoonProfile: [0.8, 1.0, 1.8, 4.2, 12.5, 25.5, 22.0, 15.2, 9.5, 6.0, 1.2, 0.3],
    climateZone: 'Tropical Monsoon',
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    annualRainfallMm: 800,
    monsoonProfile: [0.1, 0.1, 0.2, 0.3, 0.8, 12.5, 39.5, 32.5, 12.8, 0.9, 0.2, 0.1],
    climateZone: 'Hot Semi-Arid',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    annualRainfallMm: 600,
    monsoonProfile: [0.8, 0.8, 0.8, 0.5, 1.8, 10.5, 37.0, 34.5, 11.5, 1.2, 0.3, 0.3],
    climateZone: 'Hot Semi-Arid',
  },
  {
    id: 'bhopal',
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    annualRainfallMm: 1140,
    monsoonProfile: [0.9, 0.6, 0.5, 0.4, 1.2, 13.5, 36.5, 33.0, 11.8, 1.2, 0.2, 0.2],
    climateZone: 'Humid Subtropical',
  },
];

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Calculates all rainwater harvesting parameters.
 * Formula: Volume (Litres) = Area (m2) * Rainfall (mm) * Runoff Coefficient * Filtration Efficiency
 */
export function calculateRWH(input: RWHInput, customMonsoonProfile?: number[]): RWHResults {
  const roofArea = Math.max(0, Number(input.roofAreaSqM) || 0);
  const buildings = Math.max(1, Math.round(Number(input.numberOfBuildings) || 1));
  const totalCatchmentAreaSqM = roofArea * buildings;
  const rainfall = Math.max(0, Number(input.annualRainfallMm) || 0);
  const runoffCoeff = Math.min(1, Math.max(0.1, Number(input.runoffCoefficient) || 0.8));
  const tankCapacity = Math.max(0, Number(input.storageTankCapacityL) || 0);
  const campusDailyDemand = Math.max(100, Number(input.dailyCampusDemandL) || 15000);

  // Core Hydrological Yield Equation
  // 1 mm of rain on 1 m2 yields exactly 1 Litre of water
  const annualHarvestL = Math.round(
    totalCatchmentAreaSqM * rainfall * runoffCoeff * FILTRATION_EFFICIENCY
  );
  const annualHarvestKL = Number((annualHarvestL / 1000).toFixed(1));

  // Monthly Breakdown
  const profile = customMonsoonProfile && customMonsoonProfile.length === 12
    ? customMonsoonProfile
    : [2, 2, 3, 5, 8, 15, 23, 20, 12, 6, 2, 2]; // Standard Indian National Average

  const totalProfileWeight = profile.reduce((a, b) => a + b, 0) || 100;
  const monthlyHarvestL = profile.map((weight) =>
    Math.round((annualHarvestL * weight) / totalProfileWeight)
  );

  const dailyAverageL = Math.round(annualHarvestL / 365);

  // Financial Metrics
  const estimatedAnnualSavingsINR = Math.round(annualHarvestL * WATER_TARIFF_PER_LITRE_INR);
  // 5-year savings with conservative 5% annual water tariff inflation
  let fiveYearSavingsINR = 0;
  let currentYearRate = WATER_TARIFF_PER_LITRE_INR;
  for (let y = 0; y < 5; y++) {
    fiveYearSavingsINR += Math.round(annualHarvestL * currentYearRate);
    currentYearRate *= 1.05;
  }

  // Groundwater Recharge & Environmental Metrics
  // Typically 35% of harvested volume is recharged directly into aquifers/borewells
  const groundwaterRechargeL = Math.round(annualHarvestL * 0.35);

  // Standard municipal tanker = 10,000 Litres
  const tankersEliminated = Number((annualHarvestL / 10000).toFixed(1));

  // Average mature campus shade tree (Neem, Peepal, Gulmohar) consumes ~15,000 L / year
  const treesEquivalent = Math.round(annualHarvestL / 15000);

  // Avoided municipal grid pumping: 0.36 kWh/kL * 0.82 kg CO2/kWh = 0.2952 kg CO2 per 1000 L
  const carbonFootprintSavedKg = Math.round((annualHarvestL / 1000) * 0.2952);

  // Storage Tank Analysis
  const dryDaysSustained = campusDailyDemand > 0
    ? Number((tankCapacity / campusDailyDemand).toFixed(1))
    : 0;

  const tankTurnoverRatio = tankCapacity > 0
    ? Number((annualHarvestL / tankCapacity).toFixed(2))
    : 0;

  // Sustainability Scoring Algorithm (0 - 100)
  const sustainabilityScore = computeSustainabilityScore({
    totalCatchmentAreaSqM,
    rainfall,
    runoffCoeff,
    tankCapacity,
    annualHarvestL,
    campusDailyDemand,
  });

  return {
    totalCatchmentAreaSqM,
    annualHarvestL,
    annualHarvestKL,
    monthlyHarvestL,
    dailyAverageL,
    estimatedAnnualSavingsINR,
    fiveYearSavingsINR,
    groundwaterRechargeL,
    tankersEliminated,
    treesEquivalent,
    carbonFootprintSavedKg,
    dryDaysSustained,
    tankTurnoverRatio,
    sustainabilityScore,
  };
}

/**
 * Multi-dimensional Campus Sustainability Scoring
 * Criteria:
 * 1. Catchment Scale & Planning (max 25 pts)
 * 2. Hydrological Efficiency & Surface Quality (max 25 pts)
 * 3. Storage Tank Adequacy (max 25 pts)
 * 4. Campus Water Self-Sufficiency & Offset (max 25 pts)
 */
export function computeSustainabilityScore(params: {
  totalCatchmentAreaSqM: number;
  rainfall: number;
  runoffCoeff: number;
  tankCapacity: number;
  annualHarvestL: number;
  campusDailyDemand: number;
}): {
  total: number;
  grade: string;
  level: string;
  breakdown: {
    catchmentScore: number;
    efficiencyScore: number;
    storageAdequacyScore: number;
    utilizationScore: number;
  };
} {
  const {
    totalCatchmentAreaSqM,
    rainfall,
    runoffCoeff,
    tankCapacity,
    annualHarvestL,
    campusDailyDemand,
  } = params;

  // 1. Catchment scale (2500+ sq.m typical college campus roof gets full marks)
  let catchmentScore = 0;
  if (totalCatchmentAreaSqM >= 4000) catchmentScore = 25;
  else if (totalCatchmentAreaSqM >= 2500) catchmentScore = 22;
  else if (totalCatchmentAreaSqM >= 1500) catchmentScore = 18;
  else if (totalCatchmentAreaSqM >= 800) catchmentScore = 14;
  else catchmentScore = Math.max(5, Math.round((totalCatchmentAreaSqM / 800) * 14));

  // 2. Hydrological efficiency (based on surface coefficient & rainfall availability)
  let efficiencyScore = 0;
  const surfaceBonus = (runoffCoeff >= 0.85 ? 13 : runoffCoeff >= 0.75 ? 10 : 7);
  const rainFactor = Math.min(12, Math.round((rainfall / 1500) * 12));
  efficiencyScore = surfaceBonus + rainFactor;

  // 3. Storage Tank Adequacy (optimal storage is 10% - 25% of annual harvest or >= 10 days of demand)
  let storageAdequacyScore = 0;
  if (tankCapacity > 0 && annualHarvestL > 0) {
    const ratio = tankCapacity / annualHarvestL;
    if (ratio >= 0.12 && ratio <= 0.35) {
      storageAdequacyScore = 25; // Optimum engineering sweet spot
    } else if (ratio >= 0.05 && ratio < 0.12) {
      storageAdequacyScore = 19;
    } else if (ratio > 0.35) {
      storageAdequacyScore = 22; // Oversized but high security
    } else {
      storageAdequacyScore = 12; // Undersized
    }
  } else {
    storageAdequacyScore = 5;
  }

  // 4. Campus Water Self-Sufficiency (Harvest vs Annual Campus Demand)
  let utilizationScore = 0;
  const annualCampusDemand = campusDailyDemand * 365;
  const coverageRatio = annualHarvestL / (annualCampusDemand || 1);
  if (coverageRatio >= 0.50) utilizationScore = 25;
  else if (coverageRatio >= 0.35) utilizationScore = 22;
  else if (coverageRatio >= 0.20) utilizationScore = 18;
  else if (coverageRatio >= 0.10) utilizationScore = 14;
  else utilizationScore = Math.max(6, Math.round(coverageRatio * 100));

  const rawTotal = catchmentScore + efficiencyScore + storageAdequacyScore + utilizationScore;
  const total = Math.min(100, Math.max(0, Math.round(rawTotal)));

  let grade = 'B';
  let level = 'Silver Sustainable Campus';
  if (total >= 90) {
    grade = 'A+';
    level = 'Platinum Green Campus';
  } else if (total >= 75) {
    grade = 'A';
    level = 'Gold Green Campus';
  } else if (total >= 60) {
    grade = 'B';
    level = 'Silver Sustainable Campus';
  } else if (total >= 45) {
    grade = 'C';
    level = 'Bronze Developing Campus';
  } else {
    grade = 'D';
    level = 'Baseline Campus (Action Needed)';
  }

  return {
    total,
    grade,
    level,
    breakdown: {
      catchmentScore,
      efficiencyScore,
      storageAdequacyScore,
      utilizationScore,
    },
  };
}

export const WATER_CONSERVATION_TIPS = [
  "Install ultrasonic level sensors with automatic shut-off valves on overhead tanks to eliminate overflow losses.",
  "Direct roof runoff through a dual-chambered gravel-sand-charcoal filter bed to recharge the campus borewell aquifer.",
  "Utilize first-flush diverters to automatically bypass the initial 1-2 mm of rainfall containing atmospheric dust and bird droppings.",
  "Integrate drip irrigation fed by harvested rainwater for campus botanical gardens and athletic lawns.",
  "Retrofit hostel and academic washrooms with dual-flush aerators, reducing daily water consumption by up to 40%.",
  "Conduct routine biannual ultrasonic leak detection across underground distribution piping to curb unaccounted water losses.",
  "Implement a campus greywater filtration reed-bed system to complement rooftop rainwater during dry winter months.",
  "Establish student-led Green Club monitoring stations to record weekly rainfall and storage reservoir water quality."
];
