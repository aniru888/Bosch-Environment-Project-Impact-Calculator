/**
 * Global application namespaces and initialization
 * This file must be loaded before any calculator modules
 */

// Global initialization state
window._initializationState = {
    modulesLoaded: false,
    eventSystemsInitialized: false,
    domReady: false
};

// Initialize main application namespace
window.appGlobals = {
    // Forest calculator namespace
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
    
    // Energy calculator namespace (placeholder for future implementation)
    energy: {},
    
    // Water calculator namespace
    water: {
        // DOM elements and state
        form: null,
        resultsSection: null,
        resultsBody: null,
        errorElement: null,
        waterCaptureChart: null
    },
    
    // Shared application settings
    settings: {
        debug: false,
        version: '1.0.0'
    }
};

// Global variables for storing the last calculation results
window.appGlobals.lastForestResults = null;
window.appGlobals.lastWaterResults = null;

// Species data storage
window.appGlobals.forestSpeciesData = null;

// Analytics events storage
window.appGlobals.analyticsEvents = [];

// Flag indicating whether modules have been initialized
window.appGlobals.modulesInitialized = false;

/**
 * Initialize event systems with dependency checks
 * @returns {boolean} - Whether initialization was successful
 */
window.initializeEventSystems = function() {
    // Prevent multiple initializations
    if (window._initializationState.eventSystemsInitialized) {
        console.log('Event systems already initialized');
        return true;
    }

    // Check required dependencies
    if (!window.forestCalcs || !window.waterCalcs) {
        console.error('Calculator modules not loaded. Cannot initialize event systems.');
        return false;
    }

    try {
        // Initialize forest event system
        if (window.forestCalcs.eventSystem) {
            window.forestCalcs.eventSystem.init();
            window.forestCalcs.eventSystem.initialized = true;
            console.log('Forest event system initialized globally');
        }
        
        // Initialize water event system
        if (window.waterCalcs.eventSystem) {
            window.waterCalcs.eventSystem.init();
            window.waterCalcs.eventSystem.initialized = true;
            console.log('Water event system initialized globally');
        }

        window._initializationState.eventSystemsInitialized = true;
        return true;
    } catch (error) {
        console.error('Error initializing event systems:', error);
        return false;
    }
};

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