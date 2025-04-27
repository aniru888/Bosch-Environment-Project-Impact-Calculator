/**
 * Forest DOM manipulation module
 * Handles all DOM-related functionality for the Forest calculator
 */

// Removed redundant declaration of lastResults

/**
 * Ensure the results structure is consistent before using
 * @param {object} results - Calculation results 
 * @returns {object} - Results with verified structure
 * @private
 */
function _ensureResultsIntegrity(results) {
    if (!results) return null;
    
    // Create a deep copy to avoid modifying the original
    const safeCopy = JSON.parse(JSON.stringify(results));
    
    // Ensure summary exists
    if (!safeCopy.summary) {
        console.error('Results missing summary property, creating it');
        safeCopy.summary = {
            totalCO2e: 0,
            avgAnnualCO2e: 0,
            finalCarbonStock: 0
        };
    }
    
    // Return the verified results
    return safeCopy;
}

/**
 * Initialize Forest DOM module
 * @param {object} options - Configuration options
 */
function initForestDOM(options = {}) {
    // Verify global initialization state
    if (!window._initializationState.eventSystemsInitialized) {
        console.error('Event systems must be initialized before Forest DOM module');
        return false;
    }

    // Get DOM elements
    window.appGlobals.forest.form = document.getElementById('forest-form');
    window.appGlobals.forest.resultsSection = document.getElementById('forest-results');
    window.appGlobals.forest.resultsBody = document.getElementById('forest-results-body');
    window.appGlobals.forest.errorElement = document.getElementById('forest-error');

    // Ensure required elements exist
    if (!window.appGlobals.forest.resultsSection) {
        console.error('Forest results section element (ID: forest-results) is missing. Please check the HTML structure.');
        return false;
    }
    if (!window.appGlobals.forest.resultsBody) {
        console.error('Forest results table body element (ID: forest-results-body) is missing. Please check the HTML structure.');
        return false;
    }

    // Set up form fields with defaults
    setupFormFields();

    // Set up form validation
    setupFormValidation(window.appGlobals.forest.form);

    // Register DOM callbacks with event system
    registerEventHandlers();

    // Debug log to confirm initialization
    console.log('Forest DOM module initialized, event handlers registered');
    return true;
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
    console.log('Registering forest DOM event handlers...');
    
    if (!window.forestCalcs || !window.forestCalcs.eventSystem) {
        console.error('Forest event system not available for event registration');
        return;
    }

    // Register error handler
    window.forestCalcs.eventSystem.on('error', ({ message, element }) => {
        console.log('Error event received:', message);
        showForestError(message, element);
    });
    
    // Register results handler
    window.forestCalcs.eventSystem.on('results', (results) => {
        console.log('Results event received in forestDOM:', results);
        if (!results) {
            console.error('Received empty results');
            return;
        }
        displayForestResults(results);
    });
    
    // Register reset handler
    window.forestCalcs.eventSystem.on('reset', () => {
        console.log('Reset event received');
        resetForestUI();
    });
    
    // Log to confirm event handlers were registered
    console.log('Forest DOM event handlers registered successfully');
}

/**
 * Display error message
 * @param {string} message - Error message
 * @param {HTMLElement} element - Element associated with the error
 */
function showForestError(message, element) {
    if (window.appGlobals.forest.errorElement) {
        window.appGlobals.forest.errorElement.textContent = message;
    }
    if (element) {
        element.classList.add('is-invalid'); // Add validation class if applicable
    }
}

/**
 * Clear all error messages
 */
function clearForestErrors() {
    if (window.appGlobals.forest.errorElement) {
        window.appGlobals.forest.errorElement.textContent = '';
    }
    // Remove validation classes from all inputs if needed
    const inputs = window.appGlobals.forest.form?.querySelectorAll('input');
    inputs?.forEach(input => input.classList.remove('is-invalid'));
}

/**
 * Display forest calculation results
 * @param {object} results - Calculation results
 */
function displayForestResults(results) {
    results = _ensureResultsIntegrity(results); // Ensure results integrity before using

    if (!results) {
        console.error('No results to display');
        showForestError('Calculation failed or produced no results.');
        return;
    }

    console.log('Displaying forest results:', results);
    clearForestErrors(); // Clear previous errors

    // Store results globally
    window.appGlobals.lastForestResults = results;

    // Update summary metrics
    updateSummaryMetrics(results.summary);

    // Update results table
    updateForestResultsTable(results.yearly);

    // Create or update sequestration chart
    createSequestrationChart(results, 'sequestration-chart'); // Corrected ID to match index.html

    // Update enhanced sections (cost, credits, biodiversity, beneficiaries)
    // These functions should handle their own display logic if needed
    const carbonPrice = parseFloat(window.appGlobals.forest.carbonPriceInput?.value) || 5;
    updateCostAnalysis(results.costAnalysis);
    updateCarbonCredits(results.summary.totalCO2e, carbonPrice);
    updateBiodiversity(results.biodiversity);
    updateBeneficiaries(results.beneficiaries);

    // Remove loading indicator AFTER results are displayed
    document.body.classList.remove('loading');
}

/**
 * Update summary metrics in the UI
 * @param {object} summary - Summary results
 */
function updateSummaryMetrics(summary) {
    if (!summary) {
        console.error('No summary data received in updateSummaryMetrics');
        return;
    }

    // Log the summary object to help debug
    console.log('Summary data received:', summary);

    // Extract values with proper property names - with explicit fallbacks to zero
    const totalCO2eValue = summary.totalCO2e ?? 0;
    const avgAnnualCO2eValue = summary.avgAnnualCO2e ?? 0;
    const finalCarbonStockValue = summary.finalCarbonStock ?? 0;
    
    // DIRECT APPROACH: Update the DOM elements with formatted values
    try {
        // Get elements directly by ID with error handling
        const totalCO2eElement = document.getElementById('total-co2e');
        const avgAnnualCO2eElement = document.getElementById('avg-annual-co2e');
        const finalCarbonElement = document.getElementById('final-carbon');
        
        if (totalCO2eElement) totalCO2eElement.textContent = utils.formatNumber(totalCO2eValue, 2);
        if (avgAnnualCO2eElement) avgAnnualCO2eElement.textContent = utils.formatNumber(avgAnnualCO2eValue, 2);
        if (finalCarbonElement) finalCarbonElement.textContent = utils.formatNumber(finalCarbonStockValue, 2);
        
        console.log('Summary metrics updated directly in DOM');
    } catch (err) {
        console.error('Error updating summary metrics directly:', err);
        
        // Fallback to using domUtils
        try {
            domUtils.updateMetric('total-co2e', totalCO2eValue, 2);
            domUtils.updateMetric('avg-annual-co2e', avgAnnualCO2eValue, 2);
            domUtils.updateMetric('final-carbon', finalCarbonStockValue, 2);
            console.log('Summary metrics updated using domUtils');
        } catch (err2) {
            console.error('Both direct and domUtils updates failed:', err2);
        }
    }
    
    // Optional: Make the results section visible if it's hidden
    const resultsSection = document.getElementById('forest-results');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
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
function updateForestResultsTable(yearlyData) { // RENAMED function
    // Clear existing rows
    domUtils.clearElement(window.appGlobals.forest.resultsBody);
    
    // Add rows for each year
    yearlyData.forEach(data => {
        // Add safety checks for potentially missing data points within the loop
        const year = data.year || 'N/A';
        const survivingTrees = utils.formatNumber(data.survivingTrees, 0);
        const growingStock = utils.formatNumber(data.growingStock, 1);
        const carbonContent = utils.formatNumber(data.carbonContent, 1);
        const co2e = utils.formatNumber(data.co2e, 1);
        // Check annualIncrement specifically before formatting
        const annualIncrementValue = data.annualIncrement;
        const annualIncrement = utils.formatNumber(annualIncrementValue, 1);
        const cumulativeCO2e = utils.formatNumber(data.cumulativeCO2e, 1);

        // Log if annualIncrement is problematic before formatting
        if (annualIncrementValue === undefined || annualIncrementValue === null || isNaN(annualIncrementValue)) {
             console.warn(`Year ${year}: annualIncrement is invalid:`, annualIncrementValue, 'Formatted as:', annualIncrement);
        }

        const row = domUtils.createTableRow([
            year,
            survivingTrees,
            growingStock,
            carbonContent,
            co2e,
            annualIncrement, // Pass the formatted (or '0') value
            cumulativeCO2e
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
    console.log('Chart element found:', !!chartElement, chartElementId); // Debug
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
    const co2eData = results.yearly.map(data => data.co2e || 0);
    const annualIncrementData = results.yearly.map(data => data.annualIncrement || 0);
    
    console.log('Chart data prepared:', {years, co2eData, annualIncrementData}); // Debug
    
    try {
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
                maintainAspectRatio: false, // Allow chart to control its size
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
        console.log('Chart created successfully');
    } catch (err) {
        console.error('Error creating chart:', err);
    }
}

/**
 * Reset the forest UI
 */
function resetForestUI() {
    console.log('Resetting Forest UI');
    clearForestErrors();

    // Clear results table
    if (window.appGlobals.forest.resultsBody) {
        window.domUtils.clearElement(window.appGlobals.forest.resultsBody);
    }

    // Clear summary metrics (optional: set to default values like '0' or '-')
    const metrics = document.querySelectorAll('#forest-summary-metrics .metric-value');
    metrics.forEach(metric => metric.textContent = '-');

    // Clear chart
    const chartCanvas = document.getElementById('forest-sequestration-chart');
    if (chartCanvas && window.appGlobals.forest.sequestrationChart) {
        window.appGlobals.forest.sequestrationChart.destroy();
        window.appGlobals.forest.sequestrationChart = null;
    }

    // Hide results section (optional, could just leave it empty)
    // if (window.appGlobals.forest.resultsSection) {
    //     window.appGlobals.forest.resultsSection.style.display = 'none'; // Hide it directly
    // }

    // Reset enhanced sections if they have reset functions
    // e.g., resetCostAnalysisUI(), resetCarbonCreditsUI(), etc.

    // Remove loading indicator if reset is triggered during loading
    document.body.classList.remove('loading');

    console.log('Forest UI reset complete');
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
    resetUI: resetForestUI,
    getLastResults: () => window.appGlobals.lastForestResults // Update getter to reference global variable
};
