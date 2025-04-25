/**
 * Forest DOM manipulation module
 * Handles all DOM-related functionality for the Forest calculator
 */

// Remove local variable declarations - using globals instead

/**
 * Initialize Forest DOM module
 * @param {object} options - Configuration options
 */
function initForestDOM(options = {}) {
    // Get DOM elements
    window.appGlobals.forest.form = document.getElementById('forest-form');
    window.appGlobals.forest.resultsSection = document.getElementById('forest-results');
    window.appGlobals.forest.resultsBody = document.getElementById('forest-results-body');
    window.appGlobals.forest.errorElement = document.getElementById('forest-error');
    
    // Initialize the event system if it's not already
    if (!window.forestCalcs.eventSystem.initialized) {
        window.forestCalcs.eventSystem.init();
    }
    
    // Set up form fields with defaults
    setupFormFields();
    
    // Set up form validation
    setupFormValidation(window.appGlobals.forest.form);
    
    // Register DOM callbacks with event system
    registerEventHandlers();
}

/**
 * Set up form fields with default values
 */
function setupFormFields() {
    // Defaults are already set in HTML
}

/**
 * Set up form validation
 * @param {HTMLFormElement} form - The form to validate
 */
function setupFormValidation(form) {
    // Add validation handlers to form inputs
    const numericInputs = form.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
        });
    });
}

/**
 * Validate a form input
 * @param {HTMLInputElement} input - The input to validate
 * @returns {boolean} - Whether the input is valid
 */
function validateInput(input) {
    // Check if required and empty
    if (input.required && !input.value) {
        showForestError(`${input.name} is required`, input);
        return false;
    }
    
    // Check min/max constraints
    const value = parseFloat(input.value);
    if (input.min && value < parseFloat(input.min)) {
        showForestError(`${input.name} must be at least ${input.min}`, input);
        return false;
    }
    if (input.max && value > parseFloat(input.max)) {
        showForestError(`${input.name} must be at most ${input.max}`, input);
        return false;
    }
    
    // Clear error if valid
    clearForestErrors();
    return true;
}

/**
 * Register event handlers with the event system
 */
function registerEventHandlers() {
    // Register error handler
    window.forestCalcs.eventSystem.on('error', ({ message, element }) => {
        showForestError(message, element);
    });
    
    // Register results handler
    window.forestCalcs.eventSystem.on('results', (results) => {
        displayForestResults(results);
    });
    
    // Register reset handler
    window.forestCalcs.eventSystem.on('reset', () => {
        resetForestUI();
    });
}

/**
 * Display error message
 * @param {string} message - Error message
 * @param {HTMLElement} element - Element associated with the error
 */
function showForestError(message, element) {
    if (window.appGlobals.forest.errorElement) {
        window.appGlobals.forest.errorElement.textContent = message;
        window.appGlobals.forest.errorElement.style.display = 'block';
    }
    
    // Highlight the problematic input if provided
    if (element && element.classList) {
        element.classList.add('error');
        element.focus();
    }
}

/**
 * Clear all error messages
 */
function clearForestErrors() {
    if (window.appGlobals.forest.errorElement) {
        window.appGlobals.forest.errorElement.textContent = '';
        window.appGlobals.forest.errorElement.style.display = 'none';
    }
    
    // Remove error class from all inputs
    const inputs = window.appGlobals.forest.form.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));
}

/**
 * Display forest calculation results
 * @param {object} results - Calculation results
 */
function displayForestResults(results) {
    // Show the results section
    domUtils.showElement(window.appGlobals.forest.resultsSection);
    
    // Update summary metrics
    updateSummaryMetrics(results.summary);
    
    // Create or update sequestration chart
    createSequestrationChart(results, 'sequestration-chart');
    
    // Update the results table
    updateResultsTable(results.yearly);
}

/**
 * Update summary metrics in the UI
 * @param {object} summary - Summary results
 */
function updateSummaryMetrics(summary) {
    domUtils.updateMetric('total-co2e', summary.totalCO2e, 1);
    domUtils.updateMetric('avg-annual-co2e', summary.avgAnnualCO2e, 1);
    domUtils.updateMetric('final-carbon', summary.finalCarbonStock, 1);
}

/**
 * Update cost analysis metrics
 * @param {object} costAnalysis - Cost analysis results
 */
function updateCostAnalysis(costAnalysis) {
    domUtils.updateMetric('cost-per-tonne', costAnalysis.costPerTonne, 2);
    domUtils.updateMetric('cost-per-hectare', costAnalysis.costPerHectare, 0);
    domUtils.updateMetric('establishment-cost', costAnalysis.establishmentCost, 0);
    domUtils.updateMetric('maintenance-cost', costAnalysis.maintenanceCost, 0);
    domUtils.updateMetric('monitoring-cost', costAnalysis.monitoringCost, 0);
}

/**
 * Update carbon credits metrics
 * @param {number} totalCO2e - Total CO2e sequestered
 * @param {number} carbonPrice - Carbon price per tonne
 * @param {number} riskBuffer - Risk buffer percentage
 */
function updateCarbonCredits(totalCO2e, carbonPrice, riskBuffer = 20) {
    const creditsAfterBuffer = totalCO2e * (1 - riskBuffer / 100);
    const revenue = creditsAfterBuffer * carbonPrice;
    
    domUtils.updateMetric('carbon-credits', creditsAfterBuffer, 0);
    domUtils.updateMetric('carbon-revenue', revenue, 0);
    domUtils.updateMetric('risk-buffer', riskBuffer, 0);
}

/**
 * Update biodiversity metrics
 * @param {object} biodiversity - Biodiversity metrics
 */
function updateBiodiversity(biodiversity) {
    domUtils.updateMetric('biodiversity-index', biodiversity.biodiversityIndex, 1);
    domUtils.updateMetric('species-count', biodiversity.speciesCount, 0);
    domUtils.updateMetric('habitat-creation', biodiversity.habitatCreation, 0);
    domUtils.updateMetric('species-supported', biodiversity.potentialSpeciesSupported, 0);
}

/**
 * Update beneficiaries metrics
 * @param {object} beneficiaries - Beneficiaries metrics
 */
function updateBeneficiaries(beneficiaries) {
    domUtils.updateMetric('direct-beneficiaries', beneficiaries.directBeneficiaries, 0);
    domUtils.updateMetric('indirect-beneficiaries', beneficiaries.indirectBeneficiaries, 0);
    domUtils.updateMetric('total-beneficiaries', beneficiaries.totalBeneficiaries, 0);
}

/**
 * Update the results table with yearly data
 * @param {Array} yearlyData - Array of yearly data objects
 */
function updateResultsTable(yearlyData) {
    // Clear existing rows
    domUtils.clearElement(window.appGlobals.forest.resultsBody);
    
    // Add rows for each year
    yearlyData.forEach(data => {
        const row = domUtils.createTableRow([
            data.year,
            utils.formatNumber(data.survivingTrees, 0),
            utils.formatNumber(data.growingStock, 1),
            utils.formatNumber(data.carbonContent, 1),
            utils.formatNumber(data.co2e, 1),
            utils.formatNumber(data.annualIncrement, 1),
            utils.formatNumber(data.cumulativeCO2e, 1)
        ]);
        
        window.appGlobals.forest.resultsBody.appendChild(row);
    });
}

/**
 * Create sequestration chart
 * @param {object} results - Calculation results
 * @param {string} chartElementId - ID of canvas element for chart
 */
function createSequestrationChart(results, chartElementId) {
    // Get the chart canvas element
    const chartElement = document.getElementById(chartElementId);
    if (!chartElement) return;
    
    // Check if Chart.js is available
    if (!window.Chart) {
        console.error('Chart.js not loaded');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.appGlobals.forest.sequestrationChart) {
        window.appGlobals.forest.sequestrationChart.destroy();
    }
    
    // Prepare data
    const years = results.yearly.map(data => `Year ${data.year}`);
    const co2eData = results.yearly.map(data => data.co2e);
    const annualIncrementData = results.yearly.map(data => data.annualIncrement);
    
    // Create new chart
    window.appGlobals.forest.sequestrationChart = new Chart(chartElement, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Cumulative CO₂e (tonnes)',
                    data: co2eData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Annual CO₂e (tonnes/year)',
                    data: annualIncrementData,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Cumulative CO₂e (tonnes)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Annual CO₂e (tonnes/year)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

/**
 * Reset the forest UI
 */
function resetForestUI() {
    // Hide results section
    domUtils.hideElement(window.appGlobals.forest.resultsSection);
    
    // Clear error messages
    clearForestErrors();
    
    // Destroy chart
    if (window.appGlobals.forest.sequestrationChart) {
        window.appGlobals.forest.sequestrationChart.destroy();
        window.appGlobals.forest.sequestrationChart = null;
    }
    
    // Reset form
    if (window.appGlobals.forest.form) {
        window.appGlobals.forest.form.reset();
        setupFormFields(); // Restore default values
    }
}

// Export functions
window.forestDOM = {
    init: initForestDOM,
    showError: showForestError,
    clearErrors: clearForestErrors,
    displayResults: displayForestResults,
    updateCostAnalysis,
    updateCarbonCredits,
    updateBiodiversity,
    updateBeneficiaries,
    resetUI: resetForestUI
};
