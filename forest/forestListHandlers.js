/**
 * Forest List Handlers Module
 * Manages event listeners and form handling for the Forest calculator
 */

/**
 * Initialize event listeners for forest module
 */
function initForestListeners() {
    // Get form and button elements
    window.appGlobals.forest.form = document.getElementById('forest-form');
    window.appGlobals.forest.calculateButton = document.getElementById('forest-calculate-btn');
    window.appGlobals.forest.resetButton = document.getElementById('forest-reset-btn');
    
    // Set up form submission handler
    if (window.appGlobals.forest.form) {
        window.appGlobals.forest.form.addEventListener('submit', handleForestFormSubmit);
    }
    
    // Set up reset button handler
    if (window.appGlobals.forest.resetButton) {
        window.appGlobals.forest.resetButton.addEventListener('click', handleForestReset);
    }
    
    // Set up input validation handlers
    setupInputValidation();
}

/**
 * Set up validation for input fields
 */
function setupInputValidation() {
    if (!window.appGlobals.forest.form) return;
    
    // Add validation handlers for all number inputs
    const numericInputs = window.appGlobals.forest.form.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
        });
    });
}

/**
 * Validate a numeric input field
 * @param {HTMLInputElement} input - The input field to validate
 * @returns {boolean} - Whether the input is valid
 */
function validateInput(input) {
    // Check if required and empty
    if (input.required && !input.value) {
        const fieldName = input.getAttribute('name') || 'Field';
        window.forestCalcs.eventSystem.showError(`${fieldName} is required`, input);
        return false;
    }
    
    // Check min/max constraints
    const value = parseFloat(input.value);
    if (input.min && value < parseFloat(input.min)) {
        const fieldName = input.getAttribute('name') || 'Field';
        window.forestCalcs.eventSystem.showError(`${fieldName} must be at least ${input.min}`, input);
        return false;
    }
    if (input.max && value > parseFloat(input.max)) {
        const fieldName = input.getAttribute('name') || 'Field';
        window.forestCalcs.eventSystem.showError(`${fieldName} must be at most ${input.max}`, input);
        return false;
    }
    
    // Input is valid
    return true;
}

/**
 * Handle forest form submission
 * @param {Event} event - Form submission event
 */
function handleForestFormSubmit(event) {
    event.preventDefault();
    console.log('Form submission handler triggered');
    
    // Validate all required inputs
    const allInputsValid = validateAllInputs();
    console.log('Form validation result:', allInputsValid);
    if (!allInputsValid) return;
    
    // Collect form data
    const formData = collectForestFormData();
    console.log('Collected form data:', formData);
    
    // Send to main calculation function
    window.forestMain?.calculateForest(formData);
}

/**
 * Validate all form inputs
 * @returns {boolean} - Whether all inputs are valid
 */
function validateAllInputs() {
    if (!window.appGlobals.forest.form) return true;
    
    let allValid = true;
    const requiredInputs = window.appGlobals.forest.form.querySelectorAll('input[required]');
    
    requiredInputs.forEach(input => {
        const isValid = validateInput(input);
        if (!isValid) {
            allValid = false;
        }
    });
    
    return allValid;
}

/**
 * Collect form data from the forest form
 * @returns {Object} - Form data as an object
 */
function collectForestFormData() {
    if (!window.appGlobals.forest.form) return {};
    
    // Get form elements
    window.appGlobals.forest.projectNameInput = document.getElementById('forest-name');
    window.appGlobals.forest.areaInput = document.getElementById('forest-area');
    window.appGlobals.forest.durationInput = document.getElementById('forest-duration');
    window.appGlobals.forest.densityInput = document.getElementById('forest-density');
    window.appGlobals.forest.growthRateInput = document.getElementById('forest-growth');
    window.appGlobals.forest.mortalityRateInput = document.getElementById('forest-mortality');
    window.appGlobals.forest.woodDensityInput = document.getElementById('forest-wood-density');
    window.appGlobals.forest.befInput = document.getElementById('forest-bef');
    window.appGlobals.forest.rsrInput = document.getElementById('forest-rsr');
    window.appGlobals.forest.carbonFractionInput = document.getElementById('forest-carbon');
    window.appGlobals.forest.projectCostInput = document.getElementById('forest-cost');
    window.appGlobals.forest.carbonPriceInput = document.getElementById('forest-carbon-price');
    
    // Extract values
    const formData = {
        projectName: window.appGlobals.forest.projectNameInput ? window.appGlobals.forest.projectNameInput.value : 'Forest Project',
        area: parseFloat(window.appGlobals.forest.areaInput ? window.appGlobals.forest.areaInput.value : 10),
        projectDuration: parseInt(window.appGlobals.forest.durationInput ? window.appGlobals.forest.durationInput.value : 30),
        plantingDensity: parseInt(window.appGlobals.forest.densityInput ? window.appGlobals.forest.densityInput.value : 1600),
        growthRate: parseFloat(window.appGlobals.forest.growthRateInput ? window.appGlobals.forest.growthRateInput.value : 15),
        mortalityRate: parseFloat(window.appGlobals.forest.mortalityRateInput ? window.appGlobals.forest.mortalityRateInput.value : 2),
        woodDensity: parseFloat(window.appGlobals.forest.woodDensityInput ? window.appGlobals.forest.woodDensityInput.value : 0.5),
        bef: parseFloat(window.appGlobals.forest.befInput ? window.appGlobals.forest.befInput.value : 1.5),
        rsr: parseFloat(window.appGlobals.forest.rsrInput ? window.appGlobals.forest.rsrInput.value : 0.25),
        carbonFraction: parseFloat(window.appGlobals.forest.carbonFractionInput ? window.appGlobals.forest.carbonFractionInput.value : 0.47),
        projectCost: parseFloat(window.appGlobals.forest.projectCostInput ? window.appGlobals.forest.projectCostInput.value : 50000),
        carbonPrice: parseFloat(window.appGlobals.forest.carbonPriceInput ? window.appGlobals.forest.carbonPriceInput.value : 5)
    };
    
    return formData;
}

/**
 * Handle form reset
 */
function handleForestReset() {
    // Reset form
    if (window.appGlobals.forest.form) {
        window.appGlobals.forest.form.reset();
    }
    
    // Reset UI via event system
    window.forestCalcs.eventSystem.onReset();
    
    // Track reset event
    if (window.analytics) {
        window.analytics.trackEvent('Forest', 'Reset', {});
    }
}

// Export functions
window.forestListHandlers = {
    init: initForestListeners,
    handleFormSubmit: handleForestFormSubmit,
    handleReset: handleForestReset,
    collectFormData: collectForestFormData
};
