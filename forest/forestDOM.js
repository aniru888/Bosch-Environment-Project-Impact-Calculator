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
    // Cache input elements used in event handlers or updates
    window.appGlobals.forest.carbonPriceInput = document.getElementById('forest-carbon-price');
    window.appGlobals.forest.riskBufferInput = document.getElementById('risk-buffer-input');

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

    // Set up form submission handler
    setupFormSubmissionHandler();

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
 * Set up form submission handler
 */
function setupFormSubmissionHandler() {
    const form = window.appGlobals.forest.form;
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * Handle form submission
 * @param {Event} event - Submit event from form
 */
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission behavior
    console.log('Forest form submitted');
    
    // Read form data
    const formData = {};
    const inputs = window.appGlobals.forest.form.querySelectorAll('input, select');
    inputs.forEach(input => {
        formData[input.name] = input.value;
    });
    
    // Call calculateForest with form data
    if (window.forestMain && window.forestMain.calculateForest) {
        window.forestMain.calculateForest(formData);
    }
    // Do NOT immediately make results visible here. Let the 'results' event handle it.
    // window.appGlobals.forest.resultsSection.style.display = 'block';
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
        // Hide results section on error
        if (window.appGlobals.forest.resultsSection) {
            window.appGlobals.forest.resultsSection.style.display = 'none';
        }
    });
    
    // Register results handler
    window.forestCalcs.eventSystem.on('results', (results) => {
        console.log('Results event received in forestDOM:', results);
        if (!results) {
            console.error('Received empty results');
            showForestError('Calculation produced no results.'); // Show error
            if (window.appGlobals.forest.resultsSection) { // Hide results section
                 window.appGlobals.forest.resultsSection.style.display = 'none';
            }
            return;
        }
        
        // Ensure results integrity (creates a safe copy)
        const safeResults = _ensureResultsIntegrity(results);
        if (!safeResults) { // Stop if integrity check fails
            showForestError('Received invalid results data.'); // Show error
            if (window.appGlobals.forest.resultsSection) { // Hide results section
                 window.appGlobals.forest.resultsSection.style.display = 'none';
            }
            return; 
        }

        // --- Make the results section visible FIRST --- 
        if (window.appGlobals.forest.resultsSection) {
            window.appGlobals.forest.resultsSection.style.display = 'block';
        } else {
            console.error('Cannot display results: Results section element not found.');
            return; // Don't proceed if the main container is missing
        }
        // --- Now populate the visible section --- 

        clearForestErrors(); // Clear any previous errors
        displayForestResults(safeResults); // Handles summary, table, chart

        // Update enhanced sections using data from the results object
        if (safeResults.costAnalysis) {
            updateCostAnalysis(safeResults.costAnalysis);
        }
        if (safeResults.summary) {
            // Get necessary values for carbon credits update using cached elements
            const carbonPrice = parseFloat(window.appGlobals.forest.carbonPriceInput?.value) || 5;
            const riskBuffer = parseFloat(window.appGlobals.forest.riskBufferInput?.value) || 20;
            updateCarbonCredits(safeResults.summary.totalCO2e, carbonPrice, riskBuffer);
        }
        if (safeResults.biodiversity) {
            updateBiodiversity(safeResults.biodiversity);
        }
        if (safeResults.beneficiaries) {
            updateBeneficiaries(safeResults.beneficiaries);
        }
        // Add call for green cover
        if (safeResults.greenCover) {
            updateGreenCover(safeResults.greenCover);
        }
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
 * @param {object} results - Calculation results (already integrity-checked)
 */
function displayForestResults(results) {
    // REMOVED: _ensureResultsIntegrity call (done in event handler)
    // REMOVED: window.appGlobals.lastForestResults = results; (done in forestMain)
    // REMOVED: Making resultsSection visible (done in event handler)

    if (!results) {
        console.error('No results to display in displayForestResults');
        // Error shown and section hidden by the event handler
        return;
    }

    console.log('Displaying forest results (core):', results);
    // REMOVED: clearForestErrors(); (done in event handler)

    // Update summary metrics
    updateSummaryMetrics(results.summary);

    // Update results table
    updateForestResultsTable(results.yearly);

    // Create or update sequestration chart
    createSequestrationChart(results, 'sequestration-chart');

    // REMOVED: Calls to updateCostAnalysis, updateCarbonCredits, updateBiodiversity, updateBeneficiaries
    // These are now handled by the event listener in registerEventHandlers
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

    // Extract values with proper property names and explicit fallbacks
    const totalCO2eValue = summary.totalCO2e ?? 0;
    const avgAnnualCO2eValue = summary.avgAnnualCO2e ?? 0;
    const finalCarbonStockValue = summary.finalCarbonStock ?? 0;
    
    // Get elements directly by ID
    const totalCO2eElement = document.getElementById('total-co2e');
    const avgAnnualCO2eElement = document.getElementById('avg-annual-co2e');
    const finalCarbonElement = document.getElementById('final-carbon');
    
    // Update values directly with proper error handling
    if (totalCO2eElement) totalCO2eElement.textContent = utils.formatNumber(totalCO2eValue, 1);
    if (avgAnnualCO2eElement) avgAnnualCO2eElement.textContent = utils.formatNumber(avgAnnualCO2eValue, 1);
    if (finalCarbonElement) finalCarbonElement.textContent = utils.formatNumber(finalCarbonStockValue, 1);
}

/**
 * Update cost analysis metrics
 * @param {object} costAnalysis - Cost analysis results
 */
function updateCostAnalysis(costAnalysis) {
    domUtils.updateMetric('cost-per-tonne', utils.formatNumber(costAnalysis.costPerTonne, 2), 2);
    domUtils.updateMetric('cost-per-hectare', utils.formatNumber(costAnalysis.costPerHectare, 0), 0);
    domUtils.updateMetric('establishment-cost', utils.formatNumber(costAnalysis.establishmentCost, 0), 0);
    domUtils.updateMetric('maintenance-cost', utils.formatNumber(costAnalysis.maintenanceCost, 0), 0);
    domUtils.updateMetric('monitoring-cost', utils.formatNumber(costAnalysis.monitoringCost, 0), 0);
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
    
    domUtils.updateMetric('carbon-credits', utils.formatNumber(creditsAfterBuffer, 0), 0);
    domUtils.updateMetric('carbon-revenue', utils.formatNumber(revenue, 0), 0);
    domUtils.updateMetric('risk-buffer', utils.formatNumber(riskBuffer, 0), 0);
}

/**
 * Update biodiversity metrics
 * @param {object} biodiversity - Biodiversity metrics
 */
function updateBiodiversity(biodiversity) {
    domUtils.updateMetric('biodiversity-index', utils.formatNumber(biodiversity.biodiversityIndex, 1), 1);
    domUtils.updateMetric('species-count', utils.formatNumber(biodiversity.speciesCount, 0), 0);
    domUtils.updateMetric('habitat-creation', utils.formatNumber(biodiversity.habitatCreation, 0), 0);
    domUtils.updateMetric('species-supported', utils.formatNumber(biodiversity.potentialSpeciesSupported, 0), 0);
}

/**
 * Update beneficiaries metrics
 * @param {object} beneficiaries - Beneficiaries metrics
 */
function updateBeneficiaries(beneficiaries) {
    domUtils.updateMetric('direct-beneficiaries', utils.formatNumber(beneficiaries.directBeneficiaries, 0), 0);
    domUtils.updateMetric('indirect-beneficiaries', utils.formatNumber(beneficiaries.indirectBeneficiaries, 0), 0);
    domUtils.updateMetric('total-beneficiaries', utils.formatNumber(beneficiaries.totalBeneficiaries, 0), 0);
}

/**
 * Update green cover metrics
 * @param {object} greenCover - Green cover metrics
 */
function updateGreenCover(greenCover) {
    if (!greenCover) {
        console.warn('No green cover data received in updateGreenCover');
        // Optionally clear or set default values
        domUtils.updateMetric('initial-green-cover', '-', 0);
        domUtils.updateMetric('final-green-cover', '-', 0);
        domUtils.updateMetric('green-cover-increase', '-', 0);
        return;
    }
    domUtils.updateMetric('initial-green-cover', utils.formatNumber(greenCover.initialGreenCover, 1), 1);
    domUtils.updateMetric('final-green-cover', utils.formatNumber(greenCover.finalGreenCover, 1), 1);
    domUtils.updateMetric('green-cover-increase', utils.formatNumber(greenCover.greenCoverIncrease, 1), 1);
}

/**
 * Update the results table with yearly data
 * @param {Array} yearlyData - Array of yearly data objects
 */
function updateForestResultsTable(yearlyData) {
    // Clear existing rows - Use direct domUtils access
    domUtils.clearElement(window.appGlobals.forest.resultsBody);
    
    // Add rows for each year
    yearlyData.forEach(data => {
         // Ensure numeric values first, then format for display
        const yearValue = utils.formatNumber(data.year || 0, 0);
        const survivingTreesValue = utils.formatNumber(Math.round(data.survivingTrees || 0), 0);
        const growingStockValue = utils.formatNumber(data.growingStock || 0, 1);
        const carbonContentValue = utils.formatNumber(data.carbonContent || 0, 1);
        const co2eValue = utils.formatNumber(data.co2e || 0, 1);
        const annualIncrementValue = utils.formatNumber(data.annualIncrement || 0, 1);
        const cumulativeCO2eValue = utils.formatNumber(data.cumulativeCO2e || 0, 1);

        // Format values for display - Use direct utils and domUtils access
        const row = domUtils.createTableRow([
            yearValue,
            survivingTreesValue,
            utils.formatNumber(growingStockValue, 1),
            utils.formatNumber(carbonContentValue, 1),
            utils.formatNumber(co2eValue, 1),
            utils.formatNumber(annualIncrementValue, 1),
            utils.formatNumber(cumulativeCO2eValue, 1)
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
    if (!chartElement) {
         console.error('Cannot create chart: Chart canvas element not found.');
         return;
    }
    
    // Check if Chart.js is available
    if (!window.Chart) {
        console.error('Chart.js not loaded');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.appGlobals.forest.sequestrationChart) {
        window.appGlobals.forest.sequestrationChart.destroy();
        window.appGlobals.forest.sequestrationChart = null; // Clear reference
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
    const co2eData = results.yearly.map(data => data.cumulativeCO2e || 0); // Changed to cumulative for primary axis
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
                        },
                        beginAtZero: true // Ensure Y-axis starts at 0
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
                        },
                        beginAtZero: true // Ensure Y-axis starts at 0
                    }
                }
            }
        });
        console.log('Chart created successfully');
    } catch (err) {
        console.error('Error creating chart:', err);
        // Optionally display an error message in the UI near the chart
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
        domUtils.clearElement(window.appGlobals.forest.resultsBody);
    }

    // Clear summary metrics
    const metrics = document.querySelectorAll('#forest-summary-metrics .metric-value');
    metrics.forEach(metric => metric.textContent = '-');

    // Clear chart
    if (window.appGlobals.forest.sequestrationChart) {
        window.appGlobals.forest.sequestrationChart.destroy();
        window.appGlobals.forest.sequestrationChart = null;
    }
    
    // Explicitly clear the canvas content
    const chartCanvas = document.getElementById('sequestration-chart');
    if(chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    }

    // Hide the results section on reset
    if (window.appGlobals.forest.resultsSection) {
        window.appGlobals.forest.resultsSection.style.display = 'none';
    }

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
    updateGreenCover, // Add the new function here
    resetUI: resetForestUI,
    getLastResults: () => window.appGlobals.lastForestResults // Update getter to reference global variable
};
