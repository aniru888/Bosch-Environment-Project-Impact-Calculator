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
        console.log('Starting forest calculation...');
        
        // Ensure event system is initialized
        if (!window.forestCalcs || !window.forestCalcs.eventSystem) {
            console.error('Forest event system not initialized');
            return null;
        }
        
        // Check if we have species data for multi-species mode
        const speciesData = window.forestIO?.getLoadedSpeciesData();
        const isMultiSpeciesMode = window.forestIO?.isMultiSpeciesMode();
        console.log('Multi-species mode:', isMultiSpeciesMode, 'Species data:', !!speciesData);
        
        // Perform calculation
        let results;
        if (isMultiSpeciesMode && speciesData) {
            results = window.forestCalcs.calculateSequestrationMultiSpecies(formData, speciesData);
        } else {
            results = window.forestCalcs.calculateSequestration(formData);
        }
        console.log('Calculation completed, results:', results);
        
        // Store results in global variable
        window.appGlobals.lastForestResults = results;
        
        // Calculate cost analysis
        const costAnalysis = window.forestCalcs.calculateForestCostAnalysis(
            formData.projectCost,
            formData.area,
            results
        );

        // Trigger results event - this will update the UI through the event system
        console.log('Triggering results event...');
        window.forestCalcs.eventSystem.onResults(results);
        
        // Directly display results as backup
        if (window.forestDOM && window.forestDOM.displayResults) {
            window.forestDOM.displayResults(results);
        }

        // Update cost analysis
        if (window.forestDOM) {
            window.forestDOM.updateCostAnalysis(costAnalysis);
            
            // Get carbon price from formData
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

/**
 * Debug function to display the current state of results
 */
function debugResults() {
    console.log('=== DEBUG RESULTS ===');
    const results = window.appGlobals.lastForestResults;
    console.log('Last results in globals:', results);
    
    if (results) {
        console.log('Results summary:', results.summary);
        console.log('First yearly entry:', results.yearly?.[0]);
        console.log('Last yearly entry:', results.yearly?.[results.yearly.length-1]);
    }
    
    const resultsElement = document.getElementById('forest-results');
    console.log('Results section element found:', !!resultsElement);
    if (resultsElement) {
        console.log('Results section display:', window.getComputedStyle(resultsElement).display);
        console.log('Results section visibility:', window.getComputedStyle(resultsElement).visibility);
    }
    console.log('=== END DEBUG ===');
    
    // Try to force display if results exist
    if (results && window.forestDOM && window.forestDOM.displayResults) {
        console.log('Attempting to force display of results...');
        window.forestDOM.displayResults(results);
    }
}

// Register forest calculator globally
window.forestMain = {
    init: initForestCalculator,
    calculateForest,
    resetForest,
    getLastResults,
    debugResults // Add the new function here
};
