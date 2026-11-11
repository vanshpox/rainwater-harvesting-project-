/**
 * SMART RAINWATER HARVESTING SYSTEM FOR COLLEGE CAMPUSES
 * B.Tech Mini Project · DROP (Data-driven Rainwater Optimisation Platform)
 * Created by student Vansh Kohli · Department of AI & DS (2nd Year)
 * 
 * Features:
 * - Real-time hydrological runoff calculation (IS 15797:2008 & CGWB guidelines)
 * - 4 interactive dynamic analytical visualizations
 * - Indian meteorological presets (IMD averages)
 * - Animated circular sustainability score (0-100)
 * - Environmental impact assessment
 * - PDF project report generation
 * - College viva Q&A examination guide
 * - Dark / Light theme management
 */

import Chart from 'chart.js/auto';
import confetti from 'canvas-confetti';
import {
  calculateRWH,
  INDIAN_CITIES,
  MONTH_NAMES,
  WATER_CONSERVATION_TIPS,
  FILTRATION_EFFICIENCY,
  WATER_TARIFF_PER_LITRE_INR,
} from './src/utils/calculations.ts';

// Global Application State
const state = {
  roofAreaSqM: 4500,
  annualRainfallMm: 970, // Default Bengaluru
  runoffCoefficient: 0.85, // RCC Concrete Flat Roof
  numberOfBuildings: 6,
  storageTankCapacityL: 250000,
  dailyCampusDemandL: 18000,
  selectedCityId: 'bengaluru',
  currentTipIndex: 0,
  isDark: false,
};

// Chart.js Instances
let monthlyBarChart = null;
let storageDonutChart = null;
let savingsLineChart = null;
let environmentalRadarChart = null;

// DOM Elements Cache
const elements = {
  // Theme Toggle
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  
  // Inputs & Sliders
  roofAreaInput: document.getElementById('roof-area-input'),
  roofAreaSlider: document.getElementById('roof-area-slider'),
  roofAreaVal: document.getElementById('roof-area-val'),
  
  rainfallInput: document.getElementById('rainfall-input'),
  rainfallSlider: document.getElementById('rainfall-slider'),
  rainfallVal: document.getElementById('rainfall-val'),
  
  runoffSelect: document.getElementById('runoff-select'),
  runoffVal: document.getElementById('runoff-val'),
  
  buildingsInput: document.getElementById('buildings-input'),
  buildingsSlider: document.getElementById('buildings-slider'),
  buildingsVal: document.getElementById('buildings-val'),
  
  tankInput: document.getElementById('tank-input'),
  tankSlider: document.getElementById('tank-slider'),
  tankVal: document.getElementById('tank-val'),
  
  campusDemandInput: document.getElementById('campus-demand-input'),

  // Action Buttons
  resetBtn: document.getElementById('reset-btn'),
  exportReportBtn: document.getElementById('export-report-btn'),
  exportNavBtn: document.getElementById('export-nav-btn'),
  vivaGuideBtn: document.getElementById('viva-guide-btn'),
  nextTipBtn: document.getElementById('next-tip-btn'),
  tipText: document.getElementById('tip-text'),

  // Top Statistics Strip
  statAnnualHarvest: document.getElementById('stat-annual-harvest'),
  statAnnualSavings: document.getElementById('stat-annual-savings'),
  statRecharge: document.getElementById('stat-recharge'),
  statCampusScore: document.getElementById('stat-campus-score'),

  // Results Matrix
  resAnnualHarvestL: document.getElementById('res-annual-harvest-l'),
  resAnnualHarvestKL: document.getElementById('res-annual-harvest-kl'),
  resDailyAvgL: document.getElementById('res-daily-avg-l'),
  resAnnualSavings: document.getElementById('res-annual-savings'),
  resFiveYearSavings: document.getElementById('res-five-year-savings'),
  resRechargeL: document.getElementById('res-recharge-l'),
  resDryDays: document.getElementById('res-dry-days'),
  resTankTurnover: document.getElementById('res-tank-turnover'),

  // Sustainability Gauge
  gaugeCircle: document.getElementById('gauge-progress-circle'),
  gaugeScoreText: document.getElementById('gauge-score-text'),
  gaugeGradeBadge: document.getElementById('gauge-grade-badge'),
  gaugeLevelText: document.getElementById('gauge-level-text'),
  
  scoreCatchmentFill: document.getElementById('score-catchment-fill'),
  scoreCatchmentVal: document.getElementById('score-catchment-val'),
  scoreEfficiencyFill: document.getElementById('score-efficiency-fill'),
  scoreEfficiencyVal: document.getElementById('score-efficiency-val'),
  scoreStorageFill: document.getElementById('score-storage-fill'),
  scoreStorageVal: document.getElementById('score-storage-val'),
  scoreUtilizationFill: document.getElementById('score-utilization-fill'),
  scoreUtilizationVal: document.getElementById('score-utilization-val'),

  // Environmental Impact
  ecoTankers: document.getElementById('eco-tankers'),
  ecoTrees: document.getElementById('eco-trees'),
  ecoCarbon: document.getElementById('eco-carbon'),
  ecoRecharge: document.getElementById('eco-recharge'),

  // Presets Container
  cityPillGrid: document.getElementById('city-pill-grid'),

  // Modals
  reportModal: document.getElementById('report-modal'),
  closeReportModal: document.getElementById('close-report-modal'),
  printReportBtn: document.getElementById('print-report-btn'),
  reportModalBody: document.getElementById('report-modal-body'),
  
  vivaModal: document.getElementById('viva-modal'),
  closeVivaModal: document.getElementById('close-viva-modal'),
};

/**
 * Initialize Application
 */
function initApp() {
  initTheme();
  renderCityPresets();
  initEventListeners();
  initVivaAccordion();
  initCharts();
  recalculateAndRender();
}

/**
 * Dark / Light Theme Controller
 */
function initTheme() {
  const savedTheme = localStorage.getItem('aquacampus-theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    state.isDark = true;
    document.documentElement.classList.add('dark');
  } else {
    state.isDark = false;
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcon();
}

function toggleTheme() {
  state.isDark = !state.isDark;
  if (state.isDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('aquacampus-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('aquacampus-theme', 'light');
  }
  updateThemeIcon();
  updateChartThemes();
}

function updateThemeIcon() {
  if (!elements.themeToggleBtn) return;
  elements.themeToggleBtn.innerHTML = state.isDark
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
}

/**
 * Render Indian City Preset Buttons
 */
function renderCityPresets() {
  if (!elements.cityPillGrid) return;
  elements.cityPillGrid.innerHTML = '';

  INDIAN_CITIES.forEach((city) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `city-pill-btn ${city.id === state.selectedCityId ? 'active' : ''}`;
    btn.textContent = `${city.name} (${city.annualRainfallMm} mm)`;
    btn.addEventListener('click', () => {
      selectCity(city);
    });
    elements.cityPillGrid.appendChild(btn);
  });
}

function selectCity(city) {
  state.selectedCityId = city.id;
  state.annualRainfallMm = city.annualRainfallMm;

  if (elements.rainfallInput) elements.rainfallInput.value = String(city.annualRainfallMm);
  if (elements.rainfallSlider) elements.rainfallSlider.value = String(city.annualRainfallMm);
  if (elements.rainfallVal) elements.rainfallVal.textContent = `${city.annualRainfallMm} mm`;

  // Highlight active button
  document.querySelectorAll('.city-pill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.textContent?.startsWith(city.name));
  });

  recalculateAndRender();
}

/**
 * Event Listeners for Sliders and Inputs
 */
function initEventListeners() {
  // Theme toggle
  elements.themeToggleBtn?.addEventListener('click', toggleTheme);

  // Roof Area
  const syncRoof = (val) => {
    state.roofAreaSqM = val;
    if (elements.roofAreaInput) elements.roofAreaInput.value = String(val);
    if (elements.roofAreaSlider) elements.roofAreaSlider.value = String(val);
    if (elements.roofAreaVal) elements.roofAreaVal.textContent = `${val.toLocaleString()} m²`;
    recalculateAndRender();
  };
  elements.roofAreaSlider?.addEventListener('input', (e) => syncRoof(Number(e.target.value)));
  elements.roofAreaInput?.addEventListener('input', (e) => syncRoof(Math.max(10, Number(e.target.value) || 0)));

  // Rainfall
  const syncRain = (val) => {
    state.annualRainfallMm = val;
    state.selectedCityId = ''; // Custom rainfall
    if (elements.rainfallInput) elements.rainfallInput.value = String(val);
    if (elements.rainfallSlider) elements.rainfallSlider.value = String(val);
    if (elements.rainfallVal) elements.rainfallVal.textContent = `${val} mm`;
    document.querySelectorAll('.city-pill-btn').forEach((b) => b.classList.remove('active'));
    recalculateAndRender();
  };
  elements.rainfallSlider?.addEventListener('input', (e) => syncRain(Number(e.target.value)));
  elements.rainfallInput?.addEventListener('input', (e) => syncRain(Math.max(0, Number(e.target.value) || 0)));

  // Runoff Coefficient Select
  elements.runoffSelect?.addEventListener('change', (e) => {
    state.runoffCoefficient = Number(e.target.value);
    if (elements.runoffVal) elements.runoffVal.textContent = String(state.runoffCoefficient);
    recalculateAndRender();
  });

  // Buildings
  const syncBuildings = (val) => {
    state.numberOfBuildings = val;
    if (elements.buildingsInput) elements.buildingsInput.value = String(val);
    if (elements.buildingsSlider) elements.buildingsSlider.value = String(val);
    if (elements.buildingsVal) elements.buildingsVal.textContent = `${val} Block${val > 1 ? 's' : ''}`;
    recalculateAndRender();
  };
  elements.buildingsSlider?.addEventListener('input', (e) => syncBuildings(Number(e.target.value)));
  elements.buildingsInput?.addEventListener('input', (e) => syncBuildings(Math.max(1, Number(e.target.value) || 1)));

  // Storage Tank Capacity
  const syncTank = (val) => {
    state.storageTankCapacityL = val;
    if (elements.tankInput) elements.tankInput.value = String(val);
    if (elements.tankSlider) elements.tankSlider.value = String(val);
    if (elements.tankVal) elements.tankVal.textContent = `${(val / 1000).toLocaleString()} kL`;
    recalculateAndRender();
  };
  elements.tankSlider?.addEventListener('input', (e) => syncTank(Number(e.target.value)));
  elements.tankInput?.addEventListener('input', (e) => syncTank(Math.max(1000, Number(e.target.value) || 1000)));

  // Campus Demand
  elements.campusDemandInput?.addEventListener('input', (e) => {
    state.dailyCampusDemandL = Math.max(100, Number(e.target.value) || 15000);
    recalculateAndRender();
  });

  // Reset Button
  elements.resetBtn?.addEventListener('click', () => {
    state.roofAreaSqM = 4500;
    state.annualRainfallMm = 970;
    state.runoffCoefficient = 0.85;
    state.numberOfBuildings = 6;
    state.storageTankCapacityL = 250000;
    state.dailyCampusDemandL = 18000;
    state.selectedCityId = 'bengaluru';

    syncRoof(4500);
    syncRain(970);
    syncBuildings(6);
    syncTank(250000);
    if (elements.runoffSelect) elements.runoffSelect.value = '0.85';
    if (elements.runoffVal) elements.runoffVal.textContent = '0.85';
    if (elements.campusDemandInput) elements.campusDemandInput.value = '18000';
    renderCityPresets();
    recalculateAndRender();
  });

  // Next Tip Generator
  elements.nextTipBtn?.addEventListener('click', () => {
    state.currentTipIndex = (state.currentTipIndex + 1) % WATER_CONSERVATION_TIPS.length;
    if (elements.tipText) {
      elements.tipText.style.opacity = '0';
      setTimeout(() => {
        elements.tipText.textContent = WATER_CONSERVATION_TIPS[state.currentTipIndex];
        elements.tipText.style.opacity = '1';
      }, 150);
    }
  });

  // Report Modal Open / Close
  const openReport = () => {
    populateReportModal();
    elements.reportModal?.classList.add('active');
  };
  elements.exportReportBtn?.addEventListener('click', openReport);
  elements.exportNavBtn?.addEventListener('click', openReport);
  elements.closeReportModal?.addEventListener('click', () => elements.reportModal?.classList.remove('active'));

  // Viva Modal Open / Close
  elements.vivaGuideBtn?.addEventListener('click', () => elements.vivaModal?.classList.add('active'));
  elements.closeVivaModal?.addEventListener('click', () => elements.vivaModal?.classList.remove('active'));

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === elements.reportModal) elements.reportModal?.classList.remove('active');
    if (e.target === elements.vivaModal) elements.vivaModal?.classList.remove('active');
  });

  // Print Report Handler
  elements.printReportBtn?.addEventListener('click', () => {
    window.print();
  });
}

/**
 * Initialize Viva Accordion Toggle
 */
function initVivaAccordion() {
  const items = document.querySelectorAll('.viva-item');
  items.forEach((item) => {
    const questionBtn = item.querySelector('.viva-question');
    questionBtn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach((i) => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/**
 * Recalculate Hydrological Yield and Update UI & Charts
 */
function recalculateAndRender() {
  const currentCity = INDIAN_CITIES.find((c) => c.id === state.selectedCityId);
  const results = calculateRWH({
    roofAreaSqM: state.roofAreaSqM,
    annualRainfallMm: state.annualRainfallMm,
    runoffCoefficient: state.runoffCoefficient,
    numberOfBuildings: state.numberOfBuildings,
    storageTankCapacityL: state.storageTankCapacityL,
    dailyCampusDemandL: state.dailyCampusDemandL,
  }, currentCity?.monsoonProfile);

  // Update Top Stats Strip
  if (elements.statAnnualHarvest) {
    elements.statAnnualHarvest.textContent = `${(results.annualHarvestL / 100000).toFixed(1)} Lakh L`;
  }
  if (elements.statAnnualSavings) {
    elements.statAnnualSavings.textContent = `₹${(results.estimatedAnnualSavingsINR / 100000).toFixed(2)} L`;
  }
  if (elements.statRecharge) {
    elements.statRecharge.textContent = `${(results.groundwaterRechargeL / 100000).toFixed(1)} Lakh L`;
  }
  if (elements.statCampusScore) {
    elements.statCampusScore.textContent = `${results.sustainabilityScore.total} / 100`;
  }

  // Update Results Matrix
  if (elements.resAnnualHarvestL) {
    elements.resAnnualHarvestL.textContent = results.annualHarvestL.toLocaleString();
  }
  if (elements.resAnnualHarvestKL) {
    elements.resAnnualHarvestKL.textContent = `${results.annualHarvestKL.toLocaleString()} kL`;
  }
  if (elements.resDailyAvgL) {
    elements.resDailyAvgL.textContent = results.dailyAverageL.toLocaleString();
  }
  if (elements.resAnnualSavings) {
    elements.resAnnualSavings.textContent = `₹${results.estimatedAnnualSavingsINR.toLocaleString()}`;
  }
  if (elements.resFiveYearSavings) {
    elements.resFiveYearSavings.textContent = `₹${results.fiveYearSavingsINR.toLocaleString()}`;
  }
  if (elements.resRechargeL) {
    elements.resRechargeL.textContent = `${(results.groundwaterRechargeL / 1000).toLocaleString()} kL`;
  }
  if (elements.resDryDays) {
    elements.resDryDays.textContent = `${results.dryDaysSustained} Days`;
  }
  if (elements.resTankTurnover) {
    elements.resTankTurnover.textContent = `${results.tankTurnoverRatio}x`;
  }

  // Update Environmental Impact
  if (elements.ecoTankers) {
    elements.ecoTankers.textContent = `${results.tankersEliminated.toLocaleString()} Tankers`;
  }
  if (elements.ecoTrees) {
    elements.ecoTrees.textContent = `${results.treesEquivalent.toLocaleString()} Trees`;
  }
  if (elements.ecoCarbon) {
    elements.ecoCarbon.textContent = `${results.carbonFootprintSavedKg.toLocaleString()} kg CO₂`;
  }
  if (elements.ecoRecharge) {
    elements.ecoRecharge.textContent = `${(results.groundwaterRechargeL / 1000).toFixed(0)} kL`;
  }

  // Update Sustainability Score Gauge
  updateScoreGauge(results.sustainabilityScore);

  // Update Chart.js Visuals
  updateCharts(results);
}

/**
 * Animate Circular Gauge and Progress Bars
 */
function updateScoreGauge(scoreData) {
  const { total, grade, level, breakdown } = scoreData;

  // Circular gauge: Circumference = 2 * PI * 90 = ~565.48
  const circumference = 565.48;
  const offset = circumference - (total / 100) * circumference;

  if (elements.gaugeCircle) {
    elements.gaugeCircle.style.strokeDashoffset = String(offset);
    if (total >= 85) {
      elements.gaugeCircle.style.stroke = 'var(--accent-emerald)';
    } else if (total >= 70) {
      elements.gaugeCircle.style.stroke = 'var(--accent-teal)';
    } else if (total >= 50) {
      elements.gaugeCircle.style.stroke = 'var(--accent-blue)';
    } else {
      elements.gaugeCircle.style.stroke = 'var(--accent-amber)';
    }
  }

  if (elements.gaugeScoreText) {
    elements.gaugeScoreText.textContent = String(total);
  }

  if (elements.gaugeGradeBadge) {
    elements.gaugeGradeBadge.textContent = `Grade ${grade}`;
  }

  if (elements.gaugeLevelText) {
    elements.gaugeLevelText.textContent = level;
  }

  // Breakdown bars
  if (elements.scoreCatchmentFill) {
    elements.scoreCatchmentFill.style.width = `${(breakdown.catchmentScore / 25) * 100}%`;
  }
  if (elements.scoreCatchmentVal) {
    elements.scoreCatchmentVal.textContent = `${breakdown.catchmentScore}/25`;
  }

  if (elements.scoreEfficiencyFill) {
    elements.scoreEfficiencyFill.style.width = `${(breakdown.efficiencyScore / 25) * 100}%`;
  }
  if (elements.scoreEfficiencyVal) {
    elements.scoreEfficiencyVal.textContent = `${breakdown.efficiencyScore}/25`;
  }

  if (elements.scoreStorageFill) {
    elements.scoreStorageFill.style.width = `${(breakdown.storageAdequacyScore / 25) * 100}%`;
  }
  if (elements.scoreStorageVal) {
    elements.scoreStorageVal.textContent = `${breakdown.storageAdequacyScore}/25`;
  }

  if (elements.scoreUtilizationFill) {
    elements.scoreUtilizationFill.style.width = `${(breakdown.utilizationScore / 25) * 100}%`;
  }
  if (elements.scoreUtilizationVal) {
    elements.scoreUtilizationVal.textContent = `${breakdown.utilizationScore}/25`;
  }

  // Celebrate high sustainable campus score
  if (total >= 90 && Math.random() > 0.7) {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0284c7', '#059669', '#06b6d4', '#10b981'],
    });
  }
}

/**
 * Initialize 4 Chart.js Visualizations
 */
function initCharts() {
  const textColor = state.isDark ? '#cbd5e1' : '#475569';
  const gridColor = state.isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

  // Chart 1: Monthly Water Collection Bar Chart
  const monthlyCanvas = document.getElementById('monthly-chart-canvas');
  if (monthlyCanvas) {
    monthlyBarChart = new Chart(monthlyCanvas, {
      type: 'bar',
      data: {
        labels: MONTH_NAMES,
        datasets: [{
          label: 'Collection (kL)',
          data: new Array(12).fill(0),
          backgroundColor: 'rgba(2, 132, 199, 0.75)',
          hoverBackgroundColor: 'rgba(2, 132, 199, 1)',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Yield: ${context.raw} kL (${((Number(context.raw) || 0) * 1000).toLocaleString()} L)`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } },
        },
      },
    });
  }

  // Chart 2: Storage Allocation Donut Chart
  const storageCanvas = document.getElementById('storage-chart-canvas');
  if (storageCanvas) {
    storageDonutChart = new Chart(storageCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Tank Storage Reservoir', 'Aquifer Groundwater Recharge', 'Campus Landscaping Buffer'],
        datasets: [{
          data: [45, 35, 20],
          backgroundColor: ['#0284c7', '#0d9488', '#059669'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, boxWidth: 12, font: { size: 11 } },
          },
        },
        cutout: '70%',
      },
    });
  }

  // Chart 3: 5-Year Cumulative Savings Line Graph
  const savingsCanvas = document.getElementById('savings-chart-canvas');
  if (savingsCanvas) {
    savingsLineChart = new Chart(savingsCanvas, {
      type: 'line',
      data: {
        labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        datasets: [{
          label: 'Cumulative Savings (₹ Lakhs)',
          data: [1, 2.1, 3.3, 4.6, 6.0],
          borderColor: '#059669',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#059669',
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Savings: ₹${ctx.raw} Lakhs`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } },
        },
      },
    });
  }

  // Chart 4: Environmental Impact Multi-bar / Polar Dashboard
  const impactCanvas = document.getElementById('impact-chart-canvas');
  if (impactCanvas) {
    environmentalRadarChart = new Chart(impactCanvas, {
      type: 'bar',
      data: {
        labels: ['Tankers Replaced', 'Trees Hydrated', 'Aquifer (kL)', 'CO₂ Offset (kg/10)'],
        datasets: [{
          label: 'Impact Index',
          data: [120, 80, 200, 150],
          backgroundColor: [
            'rgba(2, 132, 199, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(13, 148, 136, 0.8)',
            'rgba(79, 70, 229, 0.8)',
          ],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } },
        },
      },
    });
  }
}

/**
 * Update Chart.js Data & Render
 */
function updateCharts(results) {
  // Update Monthly Chart
  if (monthlyBarChart) {
    const monthlyKL = results.monthlyHarvestL.map((l) => Number((l / 1000).toFixed(1)));
    monthlyBarChart.data.datasets[0].data = monthlyKL;
    monthlyBarChart.update();
  }

  // Update Storage Allocation Donut
  if (storageDonutChart) {
    const storedKL = Number((results.storageTankCapacityL / 1000).toFixed(1));
    const rechargeKL = Number((results.groundwaterRechargeL / 1000).toFixed(1));
    const landscapeKL = Math.max(0, Number(((results.annualHarvestL * 0.25) / 1000).toFixed(1)));
    storageDonutChart.data.datasets[0].data = [storedKL, rechargeKL, landscapeKL];
    storageDonutChart.update();
  }

  // Update 5-Year Cumulative Savings
  if (savingsLineChart) {
    const annualBase = results.estimatedAnnualSavingsINR;
    const yearPoints = [];
    let cum = 0;
    let rate = 1;
    for (let y = 1; y <= 5; y++) {
      cum += annualBase * rate;
      rate *= 1.05;
      yearPoints.push(Number((cum / 100000).toFixed(2))); // in Lakhs
    }
    savingsLineChart.data.datasets[0].data = yearPoints;
    savingsLineChart.update();
  }

  // Update Impact Dashboard
  if (environmentalRadarChart) {
    environmentalRadarChart.data.datasets[0].data = [
      Math.round(results.tankersEliminated),
      results.treesEquivalent,
      Math.round(results.groundwaterRechargeL / 1000),
      Math.round(results.carbonFootprintSavedKg / 10),
    ];
    environmentalRadarChart.update();
  }
}

/**
 * Update Chart Colors on Theme Switch
 */
function updateChartThemes() {
  const textColor = state.isDark ? '#cbd5e1' : '#475569';
  const gridColor = state.isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

  [monthlyBarChart, savingsLineChart, environmentalRadarChart].forEach((chart) => {
    if (chart) {
      if (chart.options.scales?.x) {
        chart.options.scales.x.ticks.color = textColor;
      }
      if (chart.options.scales?.y) {
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.grid.color = gridColor;
      }
      chart.update();
    }
  });

  if (storageDonutChart && storageDonutChart.options.plugins?.legend) {
    storageDonutChart.options.plugins.legend.labels.color = textColor;
    storageDonutChart.update();
  }
}

/**
 * DROP (Data-driven Rainwater Optimisation Platform) AI Assistant Engine
 */
let dropMessagesHistory = [];

function initDropAssistant() {
  const openDropNavBtn = document.getElementById('open-drop-nav-btn');
  const openDropHeroBtn = document.getElementById('open-drop-hero-btn');
  const dropFloatBtn = document.getElementById('drop-float-btn');
  const dropModal = document.getElementById('drop-modal');
  const closeDropModal = document.getElementById('close-drop-modal');
  const dropChatForm = document.getElementById('drop-chat-form');
  const dropUserInput = document.getElementById('drop-user-input');
  const promptChips = document.querySelectorAll('.drop-prompt-chip');

  const openDrop = () => {
    if (dropMessagesHistory.length === 0) {
      const currentCity = INDIAN_CITIES.find((c) => c.id === state.selectedCityId) || INDIAN_CITIES[0];
      const results = calculateRWH({
        roofAreaSqM: state.roofAreaSqM,
        annualRainfallMm: state.annualRainfallMm,
        runoffCoefficient: state.runoffCoefficient,
        numberOfBuildings: state.numberOfBuildings,
        storageTankCapacityL: state.storageTankCapacityL,
        dailyCampusDemandL: state.dailyCampusDemandL,
      }, currentCity?.monsoonProfile);

      addDropMessage('bot', `Hello! I am <strong>DROP</strong> (Data-driven Rainwater Optimisation Platform), developed by <strong>Vansh Kohli</strong> (Department of AI &amp; DS, 2nd Year).<br/><br/>I am analyzing your campus setup for <strong>${currentCity.name}</strong> (${state.annualRainfallMm} mm rainfall, ${(results.totalCatchmentAreaSqM).toLocaleString()} m² catchment). Current estimated annual harvest is <strong>${(results.annualHarvestL / 100000).toFixed(1)} Lakh Litres</strong> with a <strong>${results.sustainabilityScore.total}/100 (${results.sustainabilityScore.level})</strong> rating.<br/><br/>Click a quick optimization prompt below or ask me any question!`);
    }
    dropModal?.classList.add('active');
    setTimeout(() => dropUserInput?.focus(), 100);
  };

  openDropNavBtn?.addEventListener('click', openDrop);
  openDropHeroBtn?.addEventListener('click', openDrop);
  dropFloatBtn?.addEventListener('click', openDrop);
  closeDropModal?.addEventListener('click', () => dropModal?.classList.remove('active'));

  window.addEventListener('click', (e) => {
    if (e.target === dropModal) dropModal?.classList.remove('active');
  });

  promptChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        submitDropQuery(prompt);
      }
    });
  });

  dropChatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!dropUserInput) return;
    const text = dropUserInput.value.trim();
    if (text) {
      submitDropQuery(text);
      dropUserInput.value = '';
    }
  });
}

function addDropMessage(sender, htmlContent) {
  const container = document.getElementById('drop-messages');
  if (!container) return;

  dropMessagesHistory.push({ sender, content: htmlContent });

  const msgDiv = document.createElement('div');
  msgDiv.className = `drop-msg drop-msg-${sender}`;

  if (sender === 'bot') {
    msgDiv.innerHTML = `
      <div class="drop-avatar" style="width: 28px; height: 28px; font-size: 0.75rem; flex-shrink: 0;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      </div>
      <div class="drop-msg-bubble">${htmlContent}</div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="drop-msg-bubble">${htmlContent}</div>
    `;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function submitDropQuery(queryText) {
  addDropMessage('user', queryText);

  // Show thinking indicator
  const container = document.getElementById('drop-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'drop-msg drop-msg-bot';
  typingDiv.id = 'drop-typing-indicator';
  typingDiv.innerHTML = `
    <div class="drop-avatar" style="width: 28px; height: 28px; font-size: 0.75rem; flex-shrink: 0;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
      </svg>
    </div>
    <div class="drop-msg-bubble" style="font-style: italic; color: var(--text-muted);">
      DROP is evaluating campus hydrological parameters...
    </div>
  `;
  container?.appendChild(typingDiv);
  if (container) container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    document.getElementById('drop-typing-indicator')?.remove();
    const response = generateDropResponse(queryText);
    addDropMessage('bot', response);
  }, 450);
}

function generateDropResponse(query) {
  const currentCity = INDIAN_CITIES.find((c) => c.id === state.selectedCityId) || INDIAN_CITIES[0];
  const results = calculateRWH({
    roofAreaSqM: state.roofAreaSqM,
    annualRainfallMm: state.annualRainfallMm,
    runoffCoefficient: state.runoffCoefficient,
    numberOfBuildings: state.numberOfBuildings,
    storageTankCapacityL: state.storageTankCapacityL,
    dailyCampusDemandL: state.dailyCampusDemandL,
  }, currentCity?.monsoonProfile);

  const q = query.toLowerCase();

  // Question 1: Platinum Score Optimization
  if (q.includes('platinum') || q.includes('score') || q.includes('95')) {
    const currentScore = results.sustainabilityScore.total;
    const optimalTankKL = Math.round((results.annualHarvestL * 0.20) / 1000);
    return `
      <strong>DROP Optimization Roadmap for Platinum Rating (95+):</strong><br/><br/>
      Your campus currently scores <strong>${currentScore}/100 (${results.sustainabilityScore.level})</strong>. Here is the data-driven path to reach Platinum (95+):<br/>
      1. <strong>Storage Tank Capacity:</strong> Re-size tank from ${(state.storageTankCapacityL / 1000)} kL to approximately <strong>${optimalTankKL} kL</strong> (optimal 20% annual retention), gaining +13 points in Storage Adequacy.<br/>
      2. <strong>Surface Quality:</strong> Ensure high runoff coefficient (C &ge; 0.85) via non-porous roof coatings or concrete RCC maintenance.<br/>
      3. <strong>Aquifer Infiltration:</strong> Route at least 35% surplus overflow through designated sand-gravel injection pits to maximize groundwater rejuvenation score.<br/>
      <em>Applying these three parameters will push your campus sustainability score to 96/100 (Platinum Green Campus).</em>
    `;
  }

  // Question 2: Tank Sizing for Zero Overflow
  if (q.includes('tank') || q.includes('size') || q.includes('overflow') || q.includes('capacity')) {
    const peakMonthlyL = Math.max(...results.monthlyHarvestL);
    const recommendedTankKL = Math.round((peakMonthlyL * 0.4) / 1000);
    return `
      <strong>DROP Sizing Analysis for Storage Tanks:</strong><br/><br/>
      • <strong>Peak Monsoon Surge:</strong> In ${currentCity.name}, peak single-month collection reaches <strong>${(peakMonthlyL / 1000).toLocaleString()} kL</strong>.<br/>
      • <strong>Current Storage:</strong> ${(state.storageTankCapacityL / 1000)} kL gives an annual turnover of <strong>${results.tankTurnoverRatio}x</strong>.<br/>
      • <strong>DROP Recommendation:</strong> A storage reservoir of <strong>${recommendedTankKL} kL</strong> coupled with an automated overflow diversion weir provides optimal balance between capital excavation expenditure and zero-spillage conservation.
    `;
  }

  // Question 3: Payback & ROI
  if (q.includes('payback') || q.includes('roi') || q.includes('cost') || q.includes('investment') || q.includes('saving')) {
    const estimatedCapexINR = Math.round(state.storageTankCapacityL * 15); // ~₹15/L capital cost
    const paybackYears = (estimatedCapexINR / (results.estimatedAnnualSavingsINR || 1)).toFixed(1);
    return `
      <strong>DROP Techno-Economic Payback Analysis:</strong><br/><br/>
      • <strong>Annual Water Savings:</strong> <strong>₹${results.estimatedAnnualSavingsINR.toLocaleString()}</strong> / year (at municipal rate ₹0.045/L).<br/>
      • <strong>5-Year Cumulative Yield:</strong> <strong>₹${results.fiveYearSavingsINR.toLocaleString()}</strong>.<br/>
      • <strong>Estimated Capital Sump Cost:</strong> ~₹${estimatedCapexINR.toLocaleString()} (for ${(state.storageTankCapacityL / 1000)} kL capacity).<br/>
      • <strong>Simple Payback Period:</strong> <strong>${paybackYears} Years</strong>.<br/>
      <em>After year ${paybackYears}, the institution generates 100% net-positive free non-potable water for hostels, laboratories, and horticulture.</em>
    `;
  }

  // Question 4: Groundwater Recharge & Aquifer
  if (q.includes('recharge') || q.includes('groundwater') || q.includes('aquifer') || q.includes('borewell')) {
    return `
      <strong>DROP Groundwater Recharge Recommendation:</strong><br/><br/>
      • <strong>Calculated Infiltration Volume:</strong> <strong>${(results.groundwaterRechargeL / 1000).toLocaleString()} kL</strong> annually.<br/>
      • <strong>Injection Well Design:</strong> Install a 150 mm slotted PVC casing borewell surrounded by a 2m &times; 2m gravel-sand-charcoal percolation pit.<br/>
      • <strong>First-Flush Safety:</strong> Always route through the buoyant-valve first-flush chamber to protect deep aquifers from surface silt and bird droppings, adhering to Central Ground Water Board guidelines.
    `;
  }

  // Question 5: Student & Project Info
  if (q.includes('who') || q.includes('created') || q.includes('vansh') || q.includes('author') || q.includes('developer')) {
    return `
      <strong>About the Developer:</strong><br/><br/>
      This project and the DROP platform were created by <strong>Vansh Kohli</strong>, a 2nd-year undergraduate student in the <strong>Department of Artificial Intelligence &amp; Data Science (AI &amp; DS)</strong>.<br/><br/>
      DROP was engineered to demonstrate how data science and mathematical simulation can solve real-world sustainability challenges across Indian university campuses.
    `;
  }

  // General Fallback Query
  return `
    <strong>DROP Analytical Assessment:</strong><br/><br/>
    For your current configuration in <strong>${currentCity.name}</strong>:<br/>
    • <strong>Total Catchment:</strong> ${(results.totalCatchmentAreaSqM).toLocaleString()} m² across ${state.numberOfBuildings} blocks.<br/>
    • <strong>Annual Harvest:</strong> <strong>${results.annualHarvestL.toLocaleString()} Litres</strong> (${results.annualHarvestKL.toLocaleString()} kL).<br/>
    • <strong>Daily Non-Potable Output:</strong> ${results.dailyAverageL.toLocaleString()} L / day.<br/>
    • <strong>Sustainability Rating:</strong> <strong>${results.sustainabilityScore.total}/100 (${results.sustainabilityScore.level})</strong>.<br/>
    • <strong>Municipal Tankers Displaced:</strong> ${results.tankersEliminated.toLocaleString()} tanker trucks.<br/><br/>
    <em>Feel free to adjust the sliders in the Calculator to simulate other campus sizes, or ask DROP for specific optimization tips!</em>
  `;
}

/**
 * Populate Printable Project Feasibility Report Modal
 */
function populateReportModal() {
  if (!elements.reportModalBody) return;
  const currentCity = INDIAN_CITIES.find((c) => c.id === state.selectedCityId) || INDIAN_CITIES[0];
  const results = calculateRWH({
    roofAreaSqM: state.roofAreaSqM,
    annualRainfallMm: state.annualRainfallMm,
    runoffCoefficient: state.runoffCoefficient,
    numberOfBuildings: state.numberOfBuildings,
    storageTankCapacityL: state.storageTankCapacityL,
    dailyCampusDemandL: state.dailyCampusDemandL,
  }, currentCity?.monsoonProfile);

  const cityName = currentCity ? `${currentCity.name}, ${currentCity.state}` : 'Custom Location';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  elements.reportModalBody.innerHTML = `
    <div class="report-header-banner">
      <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">
        B.Tech Project Feasibility &amp; Optimization Report
      </h2>
      <p style="font-size: 0.95rem; font-weight: 700; color: var(--accent-blue);">
        Smart Rainwater Harvesting &amp; Groundwater Conservation System for College Campuses
      </p>
      <p style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-top: 0.25rem;">
        Created by: <strong>Vansh Kohli</strong> · Department of Artificial Intelligence &amp; Data Science (AI &amp; DS), 2nd Year
      </p>
      <p style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.25rem;">
        Generated via DROP (Data-driven Rainwater Optimisation Platform) on ${dateStr} · Reference: IS 15797:2008 &amp; CGWB
      </p>
    </div>

    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
      1. Campus Infrastructure &amp; Hydrological Parameters
    </h4>
    <table class="report-table">
      <thead>
        <tr>
          <th>System Parameter</th>
          <th>Design Input</th>
          <th>Standard Reference</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Meteorological Location</td>
          <td><strong>${cityName}</strong></td>
          <td>IMD Rainfall Atlas</td>
        </tr>
        <tr>
          <td>Average Annual Precipitation</td>
          <td class="num">${state.annualRainfallMm} mm / year</td>
          <td>Long Period Average</td>
        </tr>
        <tr>
          <td>Roof Area per Building</td>
          <td class="num">${state.roofAreaSqM.toLocaleString()} m²</td>
          <td>Campus Architectural CAD</td>
        </tr>
        <tr>
          <td>Campus Building Blocks</td>
          <td class="num">${state.numberOfBuildings} Blocks</td>
          <td>Academic, Hostel, Admin</td>
        </tr>
        <tr>
          <td>Total Effective Catchment Area</td>
          <td class="num"><strong>${results.totalCatchmentAreaSqM.toLocaleString()} m²</strong></td>
          <td>A_total = A_roof × N_blocks</td>
        </tr>
        <tr>
          <td>Runoff Surface Coefficient (C)</td>
          <td class="num">${state.runoffCoefficient}</td>
          <td>IS 15797 Table 1</td>
        </tr>
        <tr>
          <td>First-Flush & Media Filter Efficiency (η)</td>
          <td class="num">90% (0.90)</td>
          <td>Dual-Chamber Filtration Bed</td>
        </tr>
        <tr>
          <td>Underground Storage Tank Capacity</td>
          <td class="num">${(state.storageTankCapacityL / 1000).toLocaleString()} kL (${state.storageTankCapacityL.toLocaleString()} L)</td>
          <td>Storage Sump Reservoir</td>
        </tr>
      </tbody>
    </table>

    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-top: 1.5rem; margin-bottom: 0.5rem;">
      2. Hydrological Yield &amp; Water Balance Sheet
    </h4>
    <table class="report-table">
      <thead>
        <tr>
          <th>Performance Metric</th>
          <th>Calculated Output</th>
          <th>Optimization Significance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Total Annual Harvested Water</strong></td>
          <td class="num"><strong style="color: var(--accent-blue);">${results.annualHarvestL.toLocaleString()} Litres (${results.annualHarvestKL.toLocaleString()} kL)</strong></td>
          <td>Net usable volume after 10% first-flush diversion</td>
        </tr>
        <tr>
          <td>Daily Average Yield</td>
          <td class="num">${results.dailyAverageL.toLocaleString()} Litres / day</td>
          <td>Daily non-potable substitution</td>
        </tr>
        <tr>
          <td>Peak Monsoon Monthly Collection</td>
          <td class="num">${Math.max(...results.monthlyHarvestL).toLocaleString()} Litres</td>
          <td>Maximum hydraulic surge load</td>
        </tr>
        <tr>
          <td>Dedicated Groundwater Aquifer Recharge</td>
          <td class="num">${results.groundwaterRechargeL.toLocaleString()} Litres (35%)</td>
          <td>Borewell infiltration via injection pit</td>
        </tr>
        <tr>
          <td>Storage Tank Turnover Ratio</td>
          <td class="num">${results.tankTurnoverRatio}x / year</td>
          <td>Hydraulic volume cycle rate</td>
        </tr>
        <tr>
          <td>Non-Monsoon Dry Period Buffer</td>
          <td class="num">${results.dryDaysSustained} Days</td>
          <td>Zero-inflow reserve security</td>
        </tr>
      </tbody>
    </table>

    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-top: 1.5rem; margin-bottom: 0.5rem;">
      3. Techno-Economic Feasibility &amp; Cost-Benefit Analysis
    </h4>
    <table class="report-table">
      <thead>
        <tr>
          <th>Financial Parameter</th>
          <th>Amount (INR ₹)</th>
          <th>Basis / Metric</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Institutional Water Tariff Rate</td>
          <td class="num">₹0.045 / Litre</td>
          <td>Standard municipal &amp; commercial tanker rate (₹45 / kL)</td>
        </tr>
        <tr>
          <td><strong>Estimated Year-1 Direct Savings</strong></td>
          <td class="num"><strong style="color: var(--accent-emerald);">₹${results.estimatedAnnualSavingsINR.toLocaleString()}</strong></td>
          <td>Avoided external tanker &amp; municipal procurement</td>
        </tr>
        <tr>
          <td>5-Year Cumulative Projected Savings</td>
          <td class="num"><strong>₹${results.fiveYearSavingsINR.toLocaleString()}</strong></td>
          <td>Calculated with 5% annual water tariff escalation</td>
        </tr>
      </tbody>
    </table>

    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-top: 1.5rem; margin-bottom: 0.5rem;">
      4. Ecological Footprint &amp; Green Campus Rating
    </h4>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">MUNICIPAL TANKERS DISPLACED</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-blue);">${results.tankersEliminated.toLocaleString()} Trucks (10,000L each)</div>
      </div>
      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">MATURE CAMPUS TREES SUSTAINED</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-emerald);">${results.treesEquivalent.toLocaleString()} Trees</div>
      </div>
      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">AVOIDED PUMPING CARBON EMISSION</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-indigo);">${results.carbonFootprintSavedKg.toLocaleString()} kg CO₂</div>
      </div>
      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">CAMPUS SUSTAINABILITY SCORE</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-teal);">${results.sustainabilityScore.total} / 100 (${results.sustainabilityScore.level})</div>
      </div>
    </div>

    <div style="border-top: 1px dashed var(--border-subtle); padding-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
      <strong>Project Declaration:</strong> This technical feasibility and optimization study was developed as part of the B.Tech Curriculum by student <strong>Vansh Kohli</strong> (Department of Artificial Intelligence &amp; Data Science, 2nd Year). Sizing algorithms are powered by <strong>DROP</strong> (Data-driven Rainwater Optimisation Platform).
    </div>
  `;
}

// Bootstrap on window load
window.addEventListener('DOMContentLoaded', () => {
  initApp();
  initDropAssistant();
});
