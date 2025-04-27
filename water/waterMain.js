/**
 * Water Module Main Controller
 * Coordinates the water calculation components and manages the application flow
 */

/**
 * Initialize the Water module
 * @returns {Object} - Water calculator interface
 */
function initWater() {
    console.log('Initializing Water Calculator');
    
    // Use the globally initialized event system
    window.initializeEventSystems();
    
    // Initialize modules in the correct order
    // DOM module needs to be initialized first since other modules may depend on it
    if (window.waterDOM) {
        window.waterDOM.init();
        console.log('Water DOM module initialized');
    } else {
        console.error('Water DOM module not available');
    }
    
    // Next initialize IO and List Handlers
    if (window.waterIO) {
        window.waterIO.init();
        console.log('Water IO module initialized');
    }
    
    if (window.waterListHandlers) {
        window.waterListHandlers.init();
        console.log('Water List Handlers module initialized');
    }
    
    // Return interface for external access
    return {
        name: 'Water Calculator',
        calculate: calculateWaterImpact,
        reset: resetWaterCalculator,
        getLastResults
    };
}

/**
 * Set up water form submission handler
 */
function setupWaterFormHandler() {
    const form = document.getElementById('water-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            calculateWaterImpact(form);
        });
    }
}

/**
 * Set up water reset button handler
 */
function setupWaterResetHandler() {
    const resetBtn = document.getElementById('water-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetWaterCalculator();
        });
    }
}

/**
 * Calculate water impact from form data
 * @param {HTMLFormElement} form - The water calculation form
 */
function calculateWaterImpact(form) {
    // Clear any previous errors
    if (window.waterDOM) {
        window.waterDOM.clearErrors();
    }
    
    try {
        // Get form data
        const formData = getFormData(form);
        
        // Validate form data
        if (!validateData(formData)) {
            return;
        }
        
        // Calculate water capture
        const results = window.waterCalcs.calculateWaterCapture(formData);
        
        // Store results in global variable
        window.appGlobals.lastWaterResults = results;
        
        // Calculate cost analysis
        const costAnalysis = window.waterCalcs.calculateWaterCostAnalysis(
            formData.waterProjectCost,
            formData.waterValue,
            results
        );
        
        // Calculate environmental benefits
        const environmentalBenefits = window.waterCalcs.calculateEnvironmentalBenefits(
            formData,
            results
        );
        
        // Calculate beneficiaries
        const beneficiaries = window.waterCalcs.calculateWaterBeneficiaries(
            formData,
            results
        );

        // Trigger results event through the event system
        window.waterCalcs.eventSystem.onResults(results);
        
        // Update UI components through DOM module
        if (window.waterDOM) {
            window.waterDOM.updateCostAnalysis(costAnalysis);
            window.waterDOM.updateEnvironmentalBenefits(environmentalBenefits);
            window.waterDOM.updateBeneficiaries(beneficiaries);
        }
        
        // Track calculation in analytics
        if (window.analytics) {
            window.analytics.trackCalculation('Water', formData, results.summary);
        }
        
        return results;
    } catch (error) {
        console.error('Error calculating water impact:', error);
        handleError(`Calculation error: ${error.message}`);
        return null;
    }
}

/**
 * Get form data from the water form
 * @param {HTMLFormElement} form - The form element
 * @returns {object} - Form data as object
 */
function getFormData(form) {
    // We can use FormData API if the form is an actual form element
    if (form instanceof HTMLFormElement) {
        return {
            waterArea: parseFloat(form.waterArea.value) || 5,
            rainFall: parseFloat(form.rainFall.value) || 1200,
            runoffCoefficient: parseFloat(form.runoffCoefficient.value) || 0.7,
            captureEfficiency: parseFloat(form.captureEfficiency.value) || 0.85,
            energySavings: parseFloat(form.energySavings.value) || 1.5,
            projectDuration: parseInt(form.projectDuration.value) || 20,
            waterProjectCost: parseFloat(form.waterProjectCost.value) || 200000,
            waterValue: parseFloat(form.waterValue.value) || 50
        };
    }
    
    // If it's not a form, assume it's already an object
    return form;
}

/**
 * Validate water calculation data
 * @param {object} data - Water calculation data
 * @returns {boolean} - Whether data is valid
 */
function validateData(data) {
    // Check required fields
    if (!data.waterArea || data.waterArea <= 0) {
        handleError('Water body area must be greater than zero');
        return false;
    }
    
    if (!data.rainFall || data.rainFall <= 0) {
        handleError('Rainfall must be greater than zero');
        return false;
    }
    
    if (!data.runoffCoefficient || data.runoffCoefficient <= 0 || data.runoffCoefficient > 1) {
        handleError('Runoff coefficient must be between 0 and 1');
        return false;
    }
    
    if (!data.captureEfficiency || data.captureEfficiency <= 0 || data.captureEfficiency > 1) {
        handleError('Capture efficiency must be between 0 and 1');
        return false;
    }
    
    if (!data.projectDuration || data.projectDuration < 1) {
        handleError('Project duration must be at least 1 year');
        return false;
    }
    
    return true;
}

/**
 * Display calculation results in the UI
 * @param {object} results - Calculation results
 * @param {object} costAnalysis - Cost analysis results
 * @param {object} environmentalBenefits - Environmental benefits
 * @param {object} beneficiaries - Beneficiaries metrics
 */
function displayResults(results, costAnalysis, environmentalBenefits, beneficiaries) {
    if (window.waterDOM) {
        // Display main results
        window.waterDOM.displayResults(results);
        
        // Display additional analyses
        window.waterDOM.updateCostAnalysis(costAnalysis);
        window.waterDOM.updateEnvironmentalBenefits(environmentalBenefits);
        window.waterDOM.updateBeneficiaries(beneficiaries);
    }
    
    // Trigger results event
    if (window.waterCalcs && window.waterCalcs.eventSystem) {
        window.waterCalcs.eventSystem.onResults(results);
    }
}

/**
 * Handle calculation error
 * @param {string} message - Error message
 */
function handleError(message) {
    console.error(message);
    
    if (window.waterDOM) {
        window.waterDOM.showError(message);
    }
    
    // Trigger error event
    if (window.waterCalcs && window.waterCalcs.eventSystem) {
        window.waterCalcs.eventSystem.showError(message);
    }
}

/**
 * Reset the water calculator
 */
function resetWaterCalculator() {
    // Reset results in global state
    window.appGlobals.lastWaterResults = null;
    
    // Trigger reset event through the event system
    if (window.waterCalcs && window.waterCalcs.eventSystem) {
        window.waterCalcs.eventSystem.onReset();
    } else {
        console.error('Water event system not initialized, cannot trigger reset event');
    }
}

/**
 * Get the last calculation results
 * @returns {object|null} - Last calculation results or null if none
 */
function getLastResults() {
    return window.appGlobals.lastWaterResults;
}

// Export the API via window object
window.waterMain = {
    init: initWater,
    calculate: calculateWaterImpact,
    reset: resetWaterCalculator,
    getLastResults
};
