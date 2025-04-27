/**
 * Forest Main Module
 * Entry point for the Forest calculator
 */

/**
 * Initialize the Forest calculator
 * @returns {Object} - Forest calculator interface
 */
function initForestCalculator() {
    console.log('Initializing Forest Calculator');
    
    // Use the globally initialized event system
    window.initializeEventSystems();
    
    // Initialize other modules in the correct order
    // DOM module needs to be initialized first since other modules may depend on it
    if (window.forestDOM) {
        window.forestDOM.init();
        console.log('Forest DOM module initialized');
    } else {
        console.error('Forest DOM module not available');
    }
    
    // Next initialize IO and List Handlers
    if (window.forestIO) {
        window.forestIO.init();
        console.log('Forest IO module initialized');
    }
    
    if (window.forestListHandlers) {
        window.forestListHandlers.init();
        console.log('Forest List Handlers module initialized');
    }
    
    // Return interface for external access
    return {
        name: 'Forest Calculator',
        calculateForest,
        resetForest,
        getLastResults
    };
}

/**
 * Calculate forest sequestration
 * @param {Object} formData - Form data object
 */
function calculateForest(formData) {
    try {
        // Ensure event system is initialized
        if (!window.forestCalcs || !window.forestCalcs.eventSystem) {
            console.error('Forest event system not initialized');
            return null;
        }
        
        // Check if we have species data for multi-species mode
        const speciesData = window.forestIO?.getLoadedSpeciesData();
        const isMultiSpeciesMode = window.forestIO?.isMultiSpeciesMode();
        
        // Perform calculation
        let results;
        if (isMultiSpeciesMode && speciesData) {
            results = window.forestCalcs.calculateSequestrationMultiSpecies(formData, speciesData);
        } else {
            results = window.forestCalcs.calculateSequestration(formData);
        }
        
        // Store results in global variable
        window.appGlobals.lastForestResults = results;
        
        // Calculate cost analysis
        const costAnalysis = window.forestCalcs.calculateForestCostAnalysis(
            formData.projectCost,
            formData.area,
            results
        );

        // Trigger results event - this will update the UI through the event system
        window.forestCalcs.eventSystem.onResults(results);
        
        // Update cost analysis
        if (window.forestDOM) {
            window.forestDOM.updateCostAnalysis(costAnalysis);
            
            // Get carbon price from form data
            const carbonPrice = formData.carbonPrice || 5;
            window.forestDOM.updateCarbonCredits(results.summary.totalCO2e, carbonPrice);
        }
        
        // Update enhanced features
        if (window.forestEnhanced) {
            window.forestEnhanced.updateAllEnhancedFeatures(formData, results, speciesData);
        }
        
        // Track calculation in analytics
        if (window.analytics) {
            window.analytics.trackCalculation('Forest', formData, results.summary);
        }
        
        return results;
    } catch (error) {
        console.error('Error calculating forest sequestration:', error);
        
        // Show error via event system
        if (window.forestCalcs && window.forestCalcs.eventSystem) {
            window.forestCalcs.eventSystem.showError(`Calculation error: ${error.message}`, null);
        }
        
        return null;
    }
}

/**
 * Reset the forest calculator
 */
function resetForest() {
    // Reset results
    window.appGlobals.lastForestResults = null;
    
    // Trigger reset event with defensive check
    if (window.forestCalcs && window.forestCalcs.eventSystem) {
        window.forestCalcs.eventSystem.onReset();
    } else {
        console.error('Forest event system not initialized, cannot trigger reset event');
    }
}

/**
 * Get the last calculation results
 * @returns {Object|null} - Last calculation results or null if none
 */
function getLastResults() {
    return window.appGlobals.lastForestResults;
}

// Register forest calculator globally
window.forestMain = {
    init: initForestCalculator,
    calculateForest,
    resetForest,
    getLastResults
};
