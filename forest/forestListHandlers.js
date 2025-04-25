/**
 * Forest List Handlers Module
 * Manages event listeners and form handling for the Forest calculator
 */

// Store form and button references
let forestForm;
let calculateButton;
let resetButton;

/**
 * Initialize event listeners for forest module
 */
function initForestListeners() {
    // Get form and button elements
    forestForm = document.getElementById('forest-form');
    calculateButton = document.getElementById('forest-calculate-btn');
    resetButton = document.getElementById('forest-reset-btn');
    
    // Set up form submission handler
    if (forestForm) {
        forestForm.addEventListener('submit', handleForestFormSubmit);
    }
    
    // Set up reset button handler
    if (resetButton) {
        resetButton.addEventListener('click', handleForestReset);
    }
    
    // Set up input validation handlers
    setupInputValidation();
}

/**
 * Set up validation for input fields
 */
function setupInputValidation() {
    if (!forestForm) return;
    
    // Add validation handlers for all number inputs
    const numericInputs = forestForm.querySelectorAll('input[type="number"]');
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
    
    // Validate all required inputs
    const allInputsValid = validateAllInputs();
    if (!allInputsValid) return;
    
    // Collect form data
    const formData = collectForestFormData();
    
    // Send to main calculation function
    window.forestMain?.calculateForest(formData);
}

/**
 * Validate all form inputs
 * @returns {boolean} - Whether all inputs are valid
 */
function validateAllInputs() {
    if (!forestForm) return true;
    
    let allValid = true;
    const requiredInputs = forestForm.querySelectorAll('input[required]');
    
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
    if (!forestForm) return {};
    
    // Get form elements
    const projectNameInput = document.getElementById('forest-name');
    const areaInput = document.getElementById('forest-area');
    const durationInput = document.getElementById('forest-duration');
    const densityInput = document.getElementById('forest-density');
    const growthRateInput = document.getElementById('forest-growth');
    const mortalityRateInput = document.getElementById('forest-mortality');
    const woodDensityInput = document.getElementById('forest-wood-density');
    const befInput = document.getElementById('forest-bef');
    const rsrInput = document.getElementById('forest-rsr');
    const carbonFractionInput = document.getElementById('forest-carbon');
    const projectCostInput = document.getElementById('forest-cost');
    const carbonPriceInput = document.getElementById('forest-carbon-price');
    
    // Extract values
    const formData = {
        projectName: projectNameInput ? projectNameInput.value : 'Forest Project',
        area: parseFloat(areaInput ? areaInput.value : 10),
        projectDuration: parseInt(durationInput ? durationInput.value : 30),
        plantingDensity: parseInt(densityInput ? densityInput.value : 1600),
        growthRate: parseFloat(growthRateInput ? growthRateInput.value : 15),
        mortalityRate: parseFloat(mortalityRateInput ? mortalityRateInput.value : 2),
        woodDensity: parseFloat(woodDensityInput ? woodDensityInput.value : 0.5),
        bef: parseFloat(befInput ? befInput.value : 1.5),
        rsr: parseFloat(rsrInput ? rsrInput.value : 0.25),
        carbonFraction: parseFloat(carbonFractionInput ? carbonFractionInput.value : 0.47),
        projectCost: parseFloat(projectCostInput ? projectCostInput.value : 50000),
        carbonPrice: parseFloat(carbonPriceInput ? carbonPriceInput.value : 5)
    };
    
    return formData;
}

/**
 * Handle form reset
 */
function handleForestReset() {
    // Reset form
    if (forestForm) {
        forestForm.reset();
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
