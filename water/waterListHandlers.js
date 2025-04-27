/**
 * Water List Handlers Module
 * Manages event listeners and form handling for the Water calculator
 */

class WaterListHandlers {
    constructor() {
        this.waterList = [];
    }

    addWaterEntry(entry) {
        this.waterList.push(entry);
    }

    removeWaterEntry(index) {
        if (index >= 0 && index < this.waterList.length) {
            this.waterList.splice(index, 1);
        }
    }

    getWaterList() {
        return this.waterList;
    }

    clearWaterList() {
        this.waterList = [];
    }
}

/**
 * Initialize event listeners for water module
 */
function initWaterListeners() {
    // Get form and button elements
    window.appGlobals.water.form = document.getElementById('water-form');
    window.appGlobals.water.calculateButton = document.getElementById('water-calculate-btn');
    window.appGlobals.water.resetButton = document.getElementById('water-reset-btn');
    
    // Set up form submission handler
    if (window.appGlobals.water.form) {
        window.appGlobals.water.form.addEventListener('submit', handleWaterFormSubmit);
    }
    
    // Set up reset button handler
    if (window.appGlobals.water.resetButton) {
        window.appGlobals.water.resetButton.addEventListener('click', handleWaterReset);
    }
    
    // Set up input validation handlers
    setupInputValidation();
}

/**
 * Set up validation for input fields
 */
function setupInputValidation() {
    if (!window.appGlobals.water.form) return;
    
    // Add validation handlers for all number inputs
    const numericInputs = window.appGlobals.water.form.querySelectorAll('input[type="number"]');
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
        window.waterCalcs.eventSystem.showError(`${fieldName} is required`, input);
        return false;
    }
    
    // Check min/max constraints
    const value = parseFloat(input.value);
    if (input.min && value < parseFloat(input.min)) {
        const fieldName = input.getAttribute('name') || 'Field';
        window.waterCalcs.eventSystem.showError(`${fieldName} must be at least ${input.min}`, input);
        return false;
    }
    if (input.max && value > parseFloat(input.max)) {
        const fieldName = input.getAttribute('name') || 'Field';
        window.waterCalcs.eventSystem.showError(`${fieldName} must be at most ${input.max}`, input);
        return false;
    }
    
    // Input is valid
    return true;
}

/**
 * Handle water form submission
 * @param {Event} event - Form submission event
 */
function handleWaterFormSubmit(event) {
    event.preventDefault();

    // Add loading indicator
    document.body.classList.add('loading');

    // Clear previous errors
    window.waterDOM.clearErrors();
    
    // Validate all required inputs
    const allInputsValid = validateAllInputs();
    if (!allInputsValid) {
        // Remove loading indicator if validation fails
        document.body.classList.remove('loading');
        return;
    }
    
    // Collect form data and calculate
    const formData = window.waterIO.parseFormData(window.appGlobals.water.form);
    window.waterMain?.calculate(formData);
}

/**
 * Validate all form inputs
 * @returns {boolean} - Whether all inputs are valid
 */
function validateAllInputs() {
    if (!window.appGlobals.water.form) return true;
    
    let allValid = true;
    const requiredInputs = window.appGlobals.water.form.querySelectorAll('input[required]');
    
    requiredInputs.forEach(input => {
        const isValid = validateInput(input);
        if (!isValid) {
            allValid = false;
        }
    });
    
    return allValid;
}

/**
 * Handle form reset
 */
function handleWaterReset() {
    // Reset form
    if (window.appGlobals.water.form) {
        window.appGlobals.water.form.reset();
    }
    
    // Reset UI via event system
    window.waterCalcs.eventSystem.onReset();
    
    // Track reset event
    if (window.analytics) {
        window.analytics.trackEvent('Water', 'Reset', {});
    }
}

// Export functions via window object
window.waterListHandlers = {
    init: initWaterListeners,
    handleFormSubmit: handleWaterFormSubmit,
    handleReset: handleWaterReset
};
