/**
 * Global application namespaces and initialization
 * This file must be loaded before any calculator modules
 */

// Global initialization state
window._initializationState = window._initializationState || {
    modulesLoaded: false,
    eventSystemsInitialized: false,
    domInitialized: false,
    calculatorsInitialized: false
};

// Initialize main application namespace
window.appGlobals = window.appGlobals || {
    forest: {
        // DOM elements and state
        form: null,
        resultsSection: null,
        resultsBody: null,
        errorElement: null,
        speciesData: null,
        sequestrationChart: null,
        // Event handling properties
        calculateButton: null,
        resetButton: null,
        // Form input elements
        projectNameInput: null,
        areaInput: null,
        durationInput: null,
        densityInput: null,
        growthRateInput: null,
        mortalityRateInput: null,
        woodDensityInput: null,
        befInput: null,
        rsrInput: null,
        carbonFractionInput: null,
        projectCostInput: null,
        carbonPriceInput: null
    },
    water: {},
    lastForestResults: null,
    lastWaterResults: null,
    forestSpeciesData: null
};

// Energy calculator namespace (placeholder for future implementation)
window.appGlobals.energy = window.appGlobals.energy || {};

// Water calculator namespace
window.appGlobals.water = window.appGlobals.water || {
    // DOM elements and state
    form: null,
    resultsSection: null,
    resultsBody: null,
    errorElement: null,
    waterCaptureChart: null
};

// Shared application settings
window.appGlobals.settings = window.appGlobals.settings || {
    debug: false,
    version: '1.0.0'
};

// Analytics events storage
window.appGlobals.analyticsEvents = window.appGlobals.analyticsEvents || [];

// Flag indicating whether modules have been initialized
window.appGlobals.modulesInitialized = window.appGlobals.modulesInitialized || false;

/**
 * Initialize event systems with dependency checks
 * @returns {boolean} - Whether initialization was successful
 */
function initializeEventSystems() {
    if (!window._initializationState.eventSystemsInitialized) {
        console.log('Initializing event systems...');
        
        // Initialize the forest event system
        if (window.forestCalcs && window.forestCalcs.eventSystem) {
            window.forestCalcs.eventSystem.init();
            console.log('Forest event system initialized');
        } else {
            console.error('Forest event system not available');
        }
        
        window._initializationState.eventSystemsInitialized = true;
    }
    return window._initializationState.eventSystemsInitialized;
}

window.initializeEventSystems = initializeEventSystems;

/**
 * Check if all required modules are loaded
 * @returns {boolean} - Whether all required modules are loaded
 */
window.checkModulesLoaded = function() {
    const requiredModules = [
        'forestCalcs',
        'forestDOM',
        'forestIO',
        'waterCalcs',
        'waterDOM',
        'waterIO',
        'utils',
        'domUtils',
        'analytics'
    ];

    const missingModules = requiredModules.filter(module => !window[module]);
    if (missingModules.length > 0) {
        console.error('Missing required modules:', missingModules);
        return false;
    }

    window._initializationState.modulesLoaded = true;
    return true;
};

// Set up DOM ready check
document.addEventListener('DOMContentLoaded', () => {
    window._initializationState.domReady = true;
});

// Log initialization
console.log('Global namespaces and initialization functions defined');