/**
 * Forest DOM manipulation module
 * Handles all DOM-related functionality for the Forest calculator
 */

// Removed redundant declaration of lastResults

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
    console.log('Displaying forest results...'); // Keep one initial log

    // Check if the main results container exists
    if (!window.appGlobals.forest.resultsSection) {
        console.error('Forest results section element (ID: forest-results) not found in the DOM. Cannot display results.');
        return;
    }

    // Show the results section first and log visibility state
    const resultsSection = window.appGlobals.forest.resultsSection;
    console.log('Results section visibility before:', {
        display: resultsSection.style.display,
        classList: Array.from(resultsSection.classList),
        computedStyle: window.getComputedStyle(resultsSection).display
    });

    // Use domUtils to show element, which handles both class and style
    domUtils.showElement(resultsSection);
    // resultsSection.style.display = 'block'; // No longer needed, handled by domUtils.showElement

    console.log('Results section visibility after:', {
        display: resultsSection.style.display,
        classList: Array.from(resultsSection.classList),
        computedStyle: window.getComputedStyle(resultsSection).display
    });

    // Make sure we have valid data
    if (!results || !results.yearly || results.yearly.length === 0 || !results.summary) {
        console.error('Invalid results data received for display:', results);
        showForestError('No calculation results or summary to display.');
        return;
    }

    // Store results
    window.appGlobals.lastForestResults = results;

    // Defer DOM updates to allow rendering after section is made visible
    setTimeout(() => {
        try {
            updateSummaryMetrics(results.summary);
            createSequestrationChart(results, 'sequestration-chart');

            if (!window.appGlobals.forest.resultsBody) {
                console.error('Forest results table body element (ID: forest-results-body) not found in the DOM. Cannot update table.');
            } else {
                updateForestResultsTable(results.yearly);
            }
            console.log('Forest results display updated.'); // Log completion
        } catch (error) {
            console.error('Error during deferred DOM update for forest results:', error);
            showForestError(`Error displaying results: ${error.message}`);
        }
    }, 0); // Delay of 0ms pushes execution after current rendering cycle
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

    // Extract values with proper property names
    // Only use fallbacks for undefined values, not for zero values
    const totalCO2eValue = summary.totalCO2e !== undefined ? summary.totalCO2e : 0;
    const avgAnnualCO2eValue = summary.avgAnnualCO2e !== undefined ? summary.avgAnnualCO2e : 0;
    const finalCarbonStockValue = summary.finalCarbonStock !== undefined ? summary.finalCarbonStock : 0;
    
    // Update the DOM elements with formatted values
    domUtils.updateMetric('total-co2e', totalCO2eValue, 2);
    domUtils.updateMetric('avg-annual-co2e', avgAnnualCO2eValue, 2);
    domUtils.updateMetric('final-carbon', finalCarbonStockValue, 2);
    
    // Also add a summary display in the results section
    const summarySection = document.querySelector('.results-summary');
    if (summarySection) {
        const summaryHtml = `
            <div class="summary-box">
                <h4>Forest Carbon Summary</h4>
                <p>Total CO₂e: <strong>${utils.formatNumber(totalCO2eValue, 2)} tonnes</strong></p>
                <p>Average Annual CO₂e: <strong>${utils.formatNumber(avgAnnualCO2eValue, 2)} tonnes/year</strong></p>
                <p>Final Carbon Stock: <strong>${utils.formatNumber(finalCarbonStockValue, 2)} tonnes</strong></p>
            </div>
        `;
        
        // Create or update the summary box
        let summaryBox = summarySection.querySelector('.summary-box');
        if (!summaryBox) {
            summarySection.innerHTML += summaryHtml;
        } else {
            summaryBox.innerHTML = summaryHtml;
        }
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
    // Hide the results section
    if (window.appGlobals.forest.resultsSection) {
        window.appGlobals.forest.resultsSection.classList.add('hidden');
        window.appGlobals.forest.resultsSection.style.display = 'none';
    }

    // Clear element contents
    domUtils.clearElement(document.getElementById('forest-results-table-body'));
    domUtils.clearElement(document.getElementById('total-co2e'));
    domUtils.clearElement(document.getElementById('avg-annual-co2e'));
    domUtils.clearElement(document.getElementById('final-carbon'));
    
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
    resetUI: resetForestUI,
    getLastResults: () => window.appGlobals.lastForestResults // Update getter to reference global variable
};
