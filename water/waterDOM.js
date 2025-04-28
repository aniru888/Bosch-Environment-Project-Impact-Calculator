/**
 * Water DOM manipulation module
 * Handles all DOM-related functionality for the Water calculator
 */

// Store last calculation results
// Removed redundant declaration of lastResults

/**
 * Initialize Water DOM module
 * @param {object} options - Configuration options
 */
function initWaterDOM(options = {}) {
    // Get DOM elements
    window.appGlobals.water.form = document.getElementById('water-form');
    window.appGlobals.water.resultsSection = document.getElementById('water-results');
    window.appGlobals.water.resultsBody = document.getElementById('water-results-body');
    window.appGlobals.water.errorElement = document.getElementById('water-error');

    // Ensure required elements exist
    if (!window.appGlobals.water.resultsSection) {
        console.error('Water results section element (ID: water-results) is missing. Please check the HTML structure.');
    }
    if (!window.appGlobals.water.resultsBody) {
        console.error('Water results table body element (ID: water-results-body) is missing. Please check the HTML structure.');
    }

    // Initialize the event system if it's not already
    if (!window.waterCalcs.eventSystem.initialized) {
        window.waterCalcs.eventSystem.init();
    }

    // Set up form fields with defaults
    setupFormFields();

    // Set up form validation
    setupFormValidation(window.appGlobals.water.form);

    // Register DOM callbacks with event system
    registerEventHandlers();

    // Set up form submit handler
    setupFormSubmitHandler();

    // Debug log to confirm initialization
    console.log('Water DOM module initialized, event handlers registered');
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
        showWaterError(`${input.name} is required`, input);
        return false;
    }
    
    // Check min/max constraints
    const value = parseFloat(input.value);
    if (input.min && value < parseFloat(input.min)) {
        showWaterError(`${input.name} must be at least ${input.min}`, input);
        return false;
    }
    if (input.max && value > parseFloat(input.max)) {
        showWaterError(`${input.name} must be at most ${input.max}`, input);
        return false;
    }
    
    // Clear error if valid
    clearWaterErrors();
    return true;
}

/**
 * Set up form submit handler
 */
function setupFormSubmitHandler() {
    const form = window.appGlobals.water.form;
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // Read form data
            const formData = {};
            const formElements = form.elements;
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                if (element.name) {
                    formData[element.name] = element.value;
                }
            }

            // Call calculateWaterImpact with form data
            window.waterMain.calculate(formData);
            document.body.classList.add('loading');
        });
    }
}

/**
 * Register event handlers with the event system
 */
function registerEventHandlers() {
    // Register error handler
    window.waterCalcs.eventSystem.on('error', ({ message, element }) => {
        showWaterError(message, element);
    });
    
    // Register results handler
    window.waterCalcs.eventSystem.on('results', (results) => {
        displayWaterResults(results);
    });
    
    // Register reset handler
    window.waterCalcs.eventSystem.on('reset', () => {
        resetWaterUI();
    });
}

/**
 * Display error message
 * @param {string} message - Error message
 * @param {HTMLElement} element - Element associated with the error
 */
function showWaterError(message, element) {
    if (window.appGlobals.water.errorElement) {
        window.appGlobals.water.errorElement.textContent = message;
        window.appGlobals.water.errorElement.style.display = 'block';
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
function clearWaterErrors() {
    if (window.appGlobals.water.errorElement) {
        window.appGlobals.water.errorElement.textContent = '';
        window.appGlobals.water.errorElement.style.display = 'none';
    }
    
    // Remove error class from all inputs
    const inputs = window.appGlobals.water.form.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));
}

/**
 * Display water calculation results
 * @param {object} results - Calculation results
 */
function displayWaterResults(results) {
    // Store results
    window.appGlobals.lastWaterResults = results;

    // Update summary metrics
    updateSummaryMetrics(results.summary);
    
    // Create or update water capture chart
    createWaterCaptureChart(results, 'water-capture-chart');
    
    // Update the results table
    updateResultsTable(results.yearly);

    // Remove loading indicator AFTER results are displayed
    document.body.classList.remove('loading');
}

/**
 * Update summary metrics in the UI
 * @param {object} summary - Summary results
 */
function updateSummaryMetrics(summary) {
    domUtils.updateMetric('water-captured', summary.annualWaterCaptured, 0);
    domUtils.updateMetric('total-water-captured', summary.totalWaterCaptured, 0);
    domUtils.updateMetric('annual-energy-saved', summary.annualEnergySaved, 0);
    domUtils.updateMetric('emissions-reduction', summary.annualEmissionsReduction, 1);
    domUtils.updateMetric('total-emissions-reduction', summary.totalEmissionsReduction, 1);
}

/**
 * Update cost analysis metrics
 * @param {object} costAnalysis - Cost analysis results
 */
function updateCostAnalysis(costAnalysis) {
    domUtils.updateMetric('water-cost-per-kl', costAnalysis.costPerKL, 2);
    domUtils.updateMetric('water-annual-value', costAnalysis.annualValue, 0);
    domUtils.updateMetric('water-payback-period', costAnalysis.paybackPeriod, 1);
    domUtils.updateMetric('water-roi', costAnalysis.roi, 1);
}

/**
 * Update environmental benefits metrics
 * @param {object} benefits - Environmental benefits
 */
function updateEnvironmentalBenefits(benefits) {
    // These IDs would need to be added to the HTML if we want to display these metrics
    if (document.getElementById('groundwater-recharge')) {
        domUtils.updateMetric('groundwater-recharge', benefits.groundwaterRecharge, 0);
        domUtils.updateMetric('ecosystem-restoration', benefits.ecosystemRestoration, 0);
        domUtils.updateMetric('biodiversity-impact', benefits.biodiversityImpact, 0);
    }
}

/**
 * Update beneficiaries metrics
 * @param {object} beneficiaries - Beneficiaries metrics
 */
function updateBeneficiaries(beneficiaries) {
    // These IDs would need to be added to the HTML if we want to display these metrics
    if (document.getElementById('people-supplied')) {
        domUtils.updateMetric('people-supplied', beneficiaries.peopleSupplied, 0);
        domUtils.updateMetric('water-direct-beneficiaries', beneficiaries.directBeneficiaries, 0);
        domUtils.updateMetric('water-indirect-beneficiaries', beneficiaries.indirectBeneficiaries, 0);
        domUtils.updateMetric('water-total-beneficiaries', beneficiaries.totalBeneficiaries, 0);
    }
}

/**
 * Update the results table with yearly data
 * @param {Array} yearlyData - Array of yearly data objects
 */
function updateResultsTable(yearlyData) {
    // Clear existing rows
    domUtils.clearElement(window.appGlobals.water.resultsBody);
    
    // Add rows for each year
    yearlyData.forEach(data => {
        const row = domUtils.createTableRow([
            data.year,
            utils.formatNumber(data.annualWaterCaptured, 0),
            utils.formatNumber(data.cumulativeWaterCaptured, 0),
            utils.formatNumber(data.annualEnergySaved, 0),
            utils.formatNumber(data.annualEmissionsReduction, 1),
            utils.formatNumber(data.cumulativeEmissionsReduction, 1)
        ]);
        
        window.appGlobals.water.resultsBody.appendChild(row);
    });
}

/**
 * Create water capture chart
 * @param {object} results - Calculation results
 * @param {string} chartElementId - ID of canvas element for chart
 */
function createWaterCaptureChart(results, chartElementId) {
    // Get the chart canvas element
    const chartElement = document.getElementById(chartElementId);
    console.log('Water chart element found:', !!chartElement, chartElementId);
    if (!chartElement) return;
    
    // Check if Chart.js is available
    if (!window.Chart) {
        console.error('Chart.js not loaded');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.appGlobals.water.waterCaptureChart) {
        window.appGlobals.water.waterCaptureChart.destroy();
    }
    
    // Set proper chart dimensions
    const chartContainer = chartElement.parentElement;
    if (chartContainer) {
        chartContainer.style.height = '400px';
        chartContainer.style.width = '100%';
    }
    chartElement.style.height = '100%';
    chartElement.style.width = '100%';
    
    // Prepare data with safety checks
    const years = results.yearly.map(data => `Year ${data.year || 0}`);
    const waterData = results.yearly.map(data => data.cumulativeWaterCaptured || 0);
    const emissionsData = results.yearly.map(data => data.cumulativeEmissionsReduction || 0);
    
    console.log('Water chart data prepared:', {years, waterData, emissionsData});
    
    try {
        window.appGlobals.water.waterCaptureChart = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Cumulative Water Captured (KL)',
                        data: waterData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Cumulative Emissions Reduction (t CO₂e)',
                        data: emissionsData,
                        type: 'line',
                        fill: false,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                            text: 'Water Captured (KL)'
                        },
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Emissions Reduction (t CO₂e)'
                        },
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
        console.log('Water chart created successfully');
    } catch (err) {
        console.error('Error creating water chart:', err);
    }
}

/**
 * Reset the water UI
 */
function resetWaterUI() {
    // Clear error messages
    clearWaterErrors();
    
    // Destroy chart
    if (window.appGlobals.water.waterCaptureChart) {
        window.appGlobals.water.waterCaptureChart.destroy();
        window.appGlobals.water.waterCaptureChart = null;
    }
    
    // Reset form
    if (window.appGlobals.water.form) {
        window.appGlobals.water.form.reset();
        setupFormFields(); // Restore default values
    }

    // Clear results table
    if (window.appGlobals.water.resultsBody) {
        domUtils.clearElement(window.appGlobals.water.resultsBody);
    }

    // Reset summary metrics (optional)
    // updateSummaryMetrics({ annualWaterCaptured: 0, totalWaterCaptured: 0, annualEnergySaved: 0, annualEmissionsReduction: 0, totalEmissionsReduction: 0 });

    // Remove loading indicator if reset is triggered during loading
    document.body.classList.remove('loading');
}

// Export functions via window object
window.waterDOM = {
    init: initWaterDOM,
    showError: showWaterError,
    clearErrors: clearWaterErrors,
    displayResults: displayWaterResults,
    updateCostAnalysis,
    updateEnvironmentalBenefits,
    updateBeneficiaries,
    resetUI: resetWaterUI,
    getLastResults: () => window.appGlobals.lastWaterResults // Update getter to reference global variable
};
