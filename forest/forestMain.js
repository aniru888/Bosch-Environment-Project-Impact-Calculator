/**
 * Forest Main Module
 * Entry point for the Forest calculator
 */

// Store last calculation results
let lastResults = null;

/**
 * Initialize the Forest calculator
 * @returns {Object} - Forest calculator interface
 */
function initForestCalculator() {
    console.log('Initializing Forest Calculator');
    
    // Initialize modules
    if (window.forestDOM) {
        window.forestDOM.init();
    }
    
    if (window.forestIO) {
        window.forestIO.init();
    }
    
    if (window.forestListHandlers) {
        window.forestListHandlers.init();
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
        
        // Store results
        lastResults = results;
        
        // Calculate cost analysis
        const costAnalysis = window.forestCalcs.calculateForestCostAnalysis(
            formData.projectCost,
            formData.area,
            results
        );
        
        // Trigger results event for UI update
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
        window.forestCalcs.eventSystem.showError(`Calculation error: ${error.message}`, null);
        return null;
    }
}

/**
 * Reset the forest calculator
 */
function resetForest() {
    // Reset results
    lastResults = null;
    
    // Trigger reset event
    window.forestCalcs.eventSystem.onReset();
}

/**
 * Get the last calculation results
 * @returns {Object|null} - Last calculation results or null if none
 */
function getLastResults() {
    return lastResults;
}

// Register forest calculator globally
window.forestMain = {
    init: initForestCalculator,
    calculateForest,
    resetForest,
    getLastResults
};
