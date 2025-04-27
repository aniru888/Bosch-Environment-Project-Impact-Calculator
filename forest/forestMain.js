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
        console.log('Multi-species mode:', isMultiSpeciesMode, 'Species data:', !!speciesData);
        
        // Perform calculation
        let results;
        if (isMultiSpeciesMode && speciesData) {
            results = window.forestCalcs.calculateSequestrationMultiSpecies(formData, speciesData);
        } else {
            results = window.forestCalcs.calculateSequestration(formData);
        }

        // SIMPLIFIED APPROACH: Clean up results to ensure it has a proper summary structure
        if (!results) {
            throw new Error('Calculation produced no results');
        }

        // Ensure summary exists - this is critical
        if (!results.summary) {
            console.error('Creating missing summary property');
            results.summary = {
                totalCO2e: 0,
                avgAnnualCO2e: 0,
                finalCarbonStock: 0
            };
            
            // Try to extract from yearly data if available
            if (results.yearly && results.yearly.length > 0) {
                const finalYear = results.yearly[results.yearly.length - 1];
                if (finalYear) {
                    results.summary.totalCO2e = finalYear.cumulativeCO2e || 0;
                    results.summary.avgAnnualCO2e = finalYear.cumulativeCO2e / formData.projectDuration || 0;
                    results.summary.finalCarbonStock = finalYear.carbonContent || 0;
                }
            }
        }
        
        // Store original results directly in global state
        window.appGlobals.lastForestResults = results;
        
        // Calculate cost analysis
        const costAnalysis = window.forestCalcs.calculateForestCostAnalysis(
            formData.projectCost,
            formData.area,
            results
        );

        // Display diagnostics
        console.log('Final results structure:', {
            hasResults: !!results,
            hasSummary: !!results?.summary,
            summary: results?.summary
        });

        // Trigger results event for UI update
        if (window.forestCalcs && window.forestCalcs.eventSystem) {
            window.forestCalcs.eventSystem.onResults(results);
        } else {
            console.error('Forest event system not initialized');
        }
        
        // Update cost analysis and other UI elements directly
        if (window.forestDOM) {
            // Make direct calls to DOM update functions with explicit arguments
            window.forestDOM.updateCostAnalysis(costAnalysis);
            
            // Get carbon price from formData
            const carbonPrice = formData.carbonPrice || 5;
            window.forestDOM.updateCarbonCredits(results.summary.totalCO2e, carbonPrice);
            
            // Force display of results in case event system fails
            window.forestDOM.displayResults(results);
        }
        
        // Update enhanced features
        if (window.forestEnhanced) {
            window.forestEnhanced.updateAllEnhancedFeatures(formData, results, speciesData);
        }
        
        // Track calculation in analytics - ensure summary object is passed correctly
        if (window.analytics && results && results.summary) {
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
