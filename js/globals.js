/**
 * Global application namespaces
 * This file must be loaded before any calculator modules
 */

// Initialize main application namespace
window.appGlobals = {
    // Forest calculator namespace
    forest: {
        // Will hold DOM elements and state
        form: null,
        resultsSection: null,
        resultsBody: null,
        errorElement: null,
        speciesData: null,
        sequestrationChart: null
    },
    
    // Energy calculator namespace (placeholder for future implementation)
    energy: {},
    
    // Water calculator namespace (placeholder for future implementation)
    water: {
        // Will hold DOM elements and state
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

// Log initialization for debugging purposes
console.log('Global namespaces initialized');