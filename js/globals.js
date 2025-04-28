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

// Global initializations for utils, domUtils, and analytics
window.utils = typeof utils !== 'undefined' ? utils : (window.utils || {});
window.domUtils = typeof domUtils !== 'undefined' ? domUtils : (window.domUtils || {});
window.analytics = typeof analytics !== 'undefined' ? analytics : (window.analytics || {});

// Initialize additional module globals with consistent pattern
window.forestCalcs = typeof forestCalcs !== 'undefined' ? forestCalcs : (window.forestCalcs || {});
window.forestDOM = typeof forestDOM !== 'undefined' ? forestDOM : (window.forestDOM || {});
window.forestIO = typeof forestIO !== 'undefined' ? forestIO : (window.forestIO || {});
window.forestListHandlers = typeof forestListHandlers !== 'undefined' ? forestListHandlers : (window.forestListHandlers || {});
window.forestEnhanced = typeof forestEnhanced !== 'undefined' ? forestEnhanced : (window.forestEnhanced || {});
window.forestMain = typeof forestMain !== 'undefined' ? forestMain : (window.forestMain || {});
window.waterCalcs = typeof waterCalcs !== 'undefined' ? waterCalcs : (window.waterCalcs || {});
window.waterDOM = typeof waterDOM !== 'undefined' ? waterDOM : (window.waterDOM || {});
window.waterIO = typeof waterIO !== 'undefined' ? waterIO : (window.waterIO || {});
window.waterListHandlers = typeof waterListHandlers !== 'undefined' ? waterListHandlers : (window.waterListHandlers || {});
window.waterEnhanced = typeof waterEnhanced !== 'undefined' ? waterEnhanced : (window.waterEnhanced || {});
window.waterMain = typeof waterMain !== 'undefined' ? waterMain : (window.waterMain || {});

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

// Add DOMContentLoaded listener for initialization
document.addEventListener('DOMContentLoaded', () => {
    // REMOVED: Loading state addition
    // document.body.classList.add('loading'); 
    console.log('DOM loaded, checking modules...');

    // Check modules immediately
    if (window.checkModulesLoaded()) {
        console.log('All modules loaded successfully, initializing application...');
        
        // Initialize event systems
        if (!window.initializeEventSystems()) {
            console.error('Failed to initialize event systems');
            // REMOVED: Loading state removal on error
            return; // Stop initialization
        }
        console.log('Event systems initialized');

        // Initialize the main application
        try {
            const app = new AppMain();
            app.init(); // Call the modified init method
            window.app = app; // Store app instance globally
            console.log('AppMain initialized successfully.');
        } catch (error) {
            console.error('Fatal error during application initialization:', error);
            // Optionally show an error message to the user here
            // REMOVED: Loading state removal in catch block (no longer needed)
        }
        
        // REMOVED: Loading state removal after initialization
        console.log('Initialization complete.');

    } else {
        console.error('Failed to initialize application: missing required modules');
        // Show error message to user or handle appropriately
        // REMOVED: Loading state removal on error
    }
});